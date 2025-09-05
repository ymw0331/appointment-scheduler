import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Appointment } from '@entities/appointment.entity';
import { DayOff } from '@entities/day-off.entity';
import { UnavailableWindow } from '@entities/unavailable-window.entity';
import { ConfigService } from '../config/config.service';
import { TimeUtils } from '@common/utils/time.utils';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(DayOff)
    private readonly dayOffRepository: Repository<DayOff>,
    @InjectRepository(UnavailableWindow)
    private readonly unavailableWindowRepository: Repository<UnavailableWindow>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async createAppointment(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const config = await this.configService.getEffectiveConfig();
    const date = TimeUtils.parseDate(dto.date);
    const dayOfWeek = TimeUtils.getDayOfWeek(date);

    await this.validateAppointmentRequest(dto, config, date, dayOfWeek);

    // Use transaction for atomic booking
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Double-check availability with lock
      const conflicts = await this.checkSlotConflictsWithLock(
        queryRunner.manager.getRepository(Appointment),
        date,
        dto.time,
        dto.slots,
        config.slotDurationMinutes,
      );

      if (conflicts) {
        throw new ConflictException({
          error: 'Conflict',
          message: 'Slot already booked',
          code: 'APPT_CONFLICT',
        });
      }

      const appointment = queryRunner.manager.create(Appointment, {
        date,
        startTime: dto.time,
        slotCount: dto.slots,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
      });

      await queryRunner.manager.save(appointment);
      await queryRunner.commitTransaction();

      this.logger.log(`Appointment created: ${appointment.id}`);
      return new AppointmentResponseDto(appointment);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.appointmentRepository.remove(appointment);
    this.logger.log(`Appointment deleted: ${id}`);
  }

  async getAppointments(dateStr?: string): Promise<AppointmentResponseDto[]> {
    const query = this.appointmentRepository.createQueryBuilder('appointment');
    
    if (dateStr) {
      const date = TimeUtils.parseDate(dateStr);
      query.where('appointment.date = :date', { date });
    }

    query.orderBy('appointment.date', 'ASC')
         .addOrderBy('appointment.startTime', 'ASC');

    const appointments = await query.getMany();
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

    const isDayOff = await this.dayOffRepository.findOne({ where: { date } });
    if (isDayOff) {
      throw new BadRequestException('Date is marked as a day off');
    }

    await this.checkUnavailableWindows(date, dayOfWeek, startMinutes, endMinutes);
  }

  private async checkUnavailableWindows(
    date: Date,
    dayOfWeek: number,
    startMinutes: number,
    endMinutes: number,
  ): Promise<void> {
    const unavailableWindows = await this.unavailableWindowRepository
      .createQueryBuilder('window')
      .where('(window.weekday = :dayOfWeek AND window.date IS NULL)', { dayOfWeek })
      .orWhere('window.date = :date', { date })
      .getMany();

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

  private async checkSlotConflictsWithLock(
    appointmentRepo: Repository<Appointment>,
    date: Date,
    startTime: string,
    slotCount: number,
    slotDuration: number,
  ): Promise<boolean> {
    const startMinutes = TimeUtils.timeToMinutes(startTime);
    const endMinutes = startMinutes + slotCount * slotDuration;

    const existingAppointments = await appointmentRepo
      .createQueryBuilder('appointment')
      .where('appointment.date = :date', { date })
      .setLock('pessimistic_write')
      .getMany();

    for (const existing of existingAppointments) {
      const existingStart = TimeUtils.timeToMinutes(existing.startTime);
      const existingEnd = existingStart + existing.slotCount * slotDuration;

      if (startMinutes < existingEnd && endMinutes > existingStart) {
        return true;
      }
    }

    return false;
  }
}