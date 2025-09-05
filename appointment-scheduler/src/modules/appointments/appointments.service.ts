import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '../config/config.service';
import { TimeUtils } from '../../common/utils/time.utils';
import { Appointment } from './entities/appointment.entity';
import { DayOff } from '../admin-days-off/entities/day-off.entity';
import { UnavailableWindow } from '../admin-unavailable/entities/unavailable-window.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async createAppointment(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const date = TimeUtils.parseDate(dto.date);
    const cfg = await this.configService.getEffectiveConfig();

    // 1. Validate slot count doesn't exceed max
    if (dto.slots > cfg.maxSlotsPerAppointment) {
      throw new BadRequestException(
        `Cannot book ${dto.slots} slots. Maximum allowed: ${cfg.maxSlotsPerAppointment}`
      );
    }

    // 2. Validate time alignment to slot grid
    if (!TimeUtils.isTimeAligned(dto.time, cfg.slotDurationMinutes)) {
      throw new BadRequestException(
        `Time ${dto.time} does not align to ${cfg.slotDurationMinutes}-minute slot grid`
      );
    }

    // 3. Validate operational day
    const weekday = TimeUtils.getDayOfWeek(date);
    const operationalDaysNumbers = cfg.operationalDays.map(d => typeof d === 'string' ? parseInt(d, 10) : d);
    if (!operationalDaysNumbers.includes(weekday)) {
      throw new BadRequestException('Appointment date is not an operational day');
    }

    // 4. Validate within operational hours
    const startMinutes = TimeUtils.timeToMinutes(dto.time);
    const endMinutes = startMinutes + (cfg.slotDurationMinutes * dto.slots);
    const opStart = TimeUtils.timeToMinutes(cfg.operationalStartTime);
    const opEnd = TimeUtils.timeToMinutes(cfg.operationalEndTime);

    if (startMinutes < opStart || endMinutes > opEnd) {
      throw new BadRequestException(
        `Appointment time ${dto.time} with ${dto.slots} slots extends beyond operational hours (${cfg.operationalStartTime}-${cfg.operationalEndTime})`
      );
    }

    // 5. Check for day off
    const dayOff = await this.em.findOne(DayOff, { date });
    if (dayOff) {
      throw new BadRequestException(`${dto.date} is marked as a day off: ${dayOff.note || 'Holiday'}`);
    }

    // 6. Check for unavailable windows
    const unavailable = await this.em.find(UnavailableWindow, {
      $or: [{ weekday }, { date }],
    });

    for (const window of unavailable) {
      const windowStart = TimeUtils.timeToMinutes(window.startTime);
      const windowEnd = TimeUtils.timeToMinutes(window.endTime);
      
      if (TimeUtils.doesSlotOverlap(startMinutes, cfg.slotDurationMinutes, dto.slots, windowStart, windowEnd)) {
        throw new ConflictException(
          `Appointment conflicts with unavailable window ${window.startTime}-${window.endTime}: ${window.note || 'Unavailable'}`
        );
      }
    }

    // 7. Check for appointment conflicts (atomic check)
    const existingAppointments = await this.em.find(Appointment, { date });
    
    for (const existing of existingAppointments) {
      const existingStart = TimeUtils.timeToMinutes(existing.startTime);
      const existingEnd = existingStart + (cfg.slotDurationMinutes * existing.slotCount);
      
      if (startMinutes < existingEnd && endMinutes > existingStart) {
        throw new ConflictException(
          `Appointment conflicts with existing booking at ${existing.startTime} (${existing.slotCount} slots)`
        );
      }
    }

    // 8. Create the appointment
    const appointment = new Appointment({
      date,
      startTime: dto.time,
      slotCount: dto.slots,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
    });

    await this.em.persistAndFlush(appointment);

    return this.toResponseDto(appointment);
  }

  async cancelAppointment(id: string): Promise<void> {
    const appointment = await this.em.findOne(Appointment, { id });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    await this.em.removeAndFlush(appointment);
  }

  async getAppointments(date?: string): Promise<AppointmentResponseDto[]> {
    const where = date ? { date: TimeUtils.parseDate(date) } : {};
    const appointments = await this.em.find(Appointment, where, { orderBy: { date: 'ASC', startTime: 'ASC' } });
    
    return appointments.map(apt => this.toResponseDto(apt));
  }

  private toResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      date: TimeUtils.formatDate(appointment.date),
      startTime: TimeUtils.formatTime(appointment.startTime),
      slotCount: appointment.slotCount,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      createdAt: appointment.createdAt,
    };
  }
}
