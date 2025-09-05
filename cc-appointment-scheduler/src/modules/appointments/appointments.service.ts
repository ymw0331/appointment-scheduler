import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Appointment } from './entities/appointment.entity';
import { ConfigService } from '../config/config.service';
import { DayOff } from '../admin-days-off/entities/day-off.entity';
import { UnavailableWindow } from '../admin-unavailable/entities/unavailable-window.entity';
import { TimeUtils } from '../../common/utils/time.utils';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async createAppointment(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const config = await this.configService.getEffectiveConfig();
    const date = TimeUtils.parseDate(dto.date);
    const dayOfWeek = TimeUtils.getDayOfWeek(date);

    await this.validateAppointmentRequest(dto, config, date, dayOfWeek);

    const appointment = new Appointment({
      date,
      startTime: dto.time,
      slotCount: dto.slots,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
    });

    await this.em.persistAndFlush(appointment);
    this.logger.log(`Appointment created: ${appointment.id}`);

    return new AppointmentResponseDto(appointment);
  }

  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.em.findOne(Appointment, { id });
    
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.em.removeAndFlush(appointment);
    this.logger.log(`Appointment deleted: ${id}`);
  }

  async getAppointments(dateStr?: string): Promise<AppointmentResponseDto[]> {
    const filter: any = {};
    
    if (dateStr) {
      const date = TimeUtils.parseDate(dateStr);
      filter.date = date;
    }

    const appointments = await this.em.find(Appointment, filter, {
      orderBy: { date: 'ASC', startTime: 'ASC' },
    });

    return appointments.map((apt) => new AppointmentResponseDto(apt));
  }

  private async validateAppointmentRequest(
    dto: CreateAppointmentDto,
    config: any,
    date: Date,
    dayOfWeek: number,
  ): Promise<void> {
    if (!TimeUtils.isTimeAligned(dto.time, config.slotDurationMinutes)) {
      throw new BadRequestException(
        `Time must be aligned to ${config.slotDurationMinutes}-minute intervals`,
      );
    }

    if (dto.slots < 1 || dto.slots > config.maxSlotsPerAppointment) {
      throw new BadRequestException(
        `Slots must be between 1 and ${config.maxSlotsPerAppointment}`,
      );
    }

    if (!config.operationalDays.includes(dayOfWeek)) {
      throw new BadRequestException('Date is not an operational day');
    }

    const startMinutes = TimeUtils.timeToMinutes(dto.time);
    const endMinutes = startMinutes + dto.slots * config.slotDurationMinutes;
    const operationalStartMinutes = TimeUtils.timeToMinutes(config.operationalStartTime);
    const operationalEndMinutes = TimeUtils.timeToMinutes(config.operationalEndTime);

    if (startMinutes < operationalStartMinutes || endMinutes > operationalEndMinutes) {
      throw new BadRequestException('Appointment time is outside operational hours');
    }

    const isDayOff = await this.em.findOne(DayOff, { date });
    if (isDayOff) {
      throw new BadRequestException('Date is marked as a day off');
    }

    await this.checkUnavailableWindows(date, dayOfWeek, startMinutes, endMinutes);

    await this.checkSlotConflicts(date, dto.time, dto.slots, config.slotDurationMinutes);
  }

  private async checkUnavailableWindows(
    date: Date,
    dayOfWeek: number,
    startMinutes: number,
    endMinutes: number,
  ): Promise<void> {
    const unavailableWindows = await this.em.find(UnavailableWindow, {
      $or: [
        { weekday: dayOfWeek, date: null },
        { date },
      ],
    });

    for (const window of unavailableWindows) {
      const windowStart = TimeUtils.timeToMinutes(window.startTime);
      const windowEnd = TimeUtils.timeToMinutes(window.endTime);

      if (startMinutes < windowEnd && endMinutes > windowStart) {
        throw new BadRequestException(
          'Appointment time overlaps with an unavailable window',
        );
      }
    }
  }

  private async checkSlotConflicts(
    date: Date,
    startTime: string,
    slotCount: number,
    slotDuration: number,
  ): Promise<void> {
    const startMinutes = TimeUtils.timeToMinutes(startTime);
    const endMinutes = startMinutes + slotCount * slotDuration;

    const existingAppointments = await this.em.find(Appointment, { date });

    for (const existing of existingAppointments) {
      const existingStart = TimeUtils.timeToMinutes(existing.startTime);
      const existingEnd = existingStart + existing.slotCount * slotDuration;

      if (startMinutes < existingEnd && endMinutes > existingStart) {
        throw new ConflictException({
          error: 'Conflict',
          message: 'Slot already booked',
          code: 'APPT_CONFLICT',
        });
      }
    }
  }
}