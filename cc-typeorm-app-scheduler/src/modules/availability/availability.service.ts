import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '@entities/appointment.entity';
import { DayOff } from '@entities/day-off.entity';
import { UnavailableWindow } from '@entities/unavailable-window.entity';
import { ConfigService } from '../config/config.service';
import { TimeUtils } from '@common/utils/time.utils';
import { AvailabilitySlotDto } from './dto/availability-slot.dto';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(DayOff)
    private readonly dayOffRepository: Repository<DayOff>,
    @InjectRepository(UnavailableWindow)
    private readonly unavailableWindowRepository: Repository<UnavailableWindow>,
    private readonly configService: ConfigService,
  ) {}

  async getAvailability(dateStr: string): Promise<AvailabilitySlotDto[]> {
    const date = TimeUtils.parseDate(dateStr);
    const config = await this.configService.getEffectiveConfig();
    const dayOfWeek = TimeUtils.getDayOfWeek(date);

    // Check if operational day
    if (!config.operationalDays.includes(dayOfWeek)) {
      return [];
    }

    // Check for day off
    const isDayOff = await this.dayOffRepository.findOne({ where: { date } });
    if (isDayOff) {
      return [];
    }

    // Generate all possible slots
    const slots = TimeUtils.generateSlotTimes(
      config.operationalStartTime,
      config.operationalEndTime,
      config.slotDurationMinutes,
    );

    // Get unavailable windows
    const unavailableWindows = await this.getUnavailableWindows(date, dayOfWeek);

    // Filter out slots in unavailable windows
    const availableSlots = slots.filter((slotTime) => {
      return !this.isSlotInUnavailableWindow(
        slotTime,
        config.slotDurationMinutes,
        unavailableWindows,
      );
    });

    // Get existing appointments
    const appointments = await this.appointmentRepository.find({
      where: { date },
    });

    // Calculate availability for each slot
    const appointmentMap = new Map<string, number>();
    for (const appointment of appointments) {
      const startMinutes = TimeUtils.timeToMinutes(appointment.startTime);
      for (let i = 0; i < appointment.slotCount; i++) {
        const slotTime = TimeUtils.minutesToTime(
          startMinutes + i * config.slotDurationMinutes,
        );
        appointmentMap.set(slotTime, (appointmentMap.get(slotTime) || 0) + 1);
      }
    }

    // Return availability slots
    return availableSlots.map((time) => ({
      date: dateStr,
      time,
      available_slots: appointmentMap.has(time) ? 0 : 1,
    }));
  }

  private async getUnavailableWindows(
    date: Date,
    dayOfWeek: number,
  ): Promise<UnavailableWindow[]> {
    return await this.unavailableWindowRepository
      .createQueryBuilder('window')
      .where('(window.weekday = :dayOfWeek AND window.date IS NULL)', { dayOfWeek })
      .orWhere('window.date = :date', { date })
      .getMany();
  }

  private isSlotInUnavailableWindow(
    slotTime: string,
    slotDuration: number,
    windows: UnavailableWindow[],
  ): boolean {
    const slotStart = TimeUtils.timeToMinutes(slotTime);
    const slotEnd = slotStart + slotDuration;

    for (const window of windows) {
      const windowStart = TimeUtils.timeToMinutes(window.startTime);
      const windowEnd = TimeUtils.timeToMinutes(window.endTime);

      if (TimeUtils.doesSlotOverlap(slotStart, slotDuration, 1, windowStart, windowEnd)) {
        return true;
      }
    }

    return false;
  }
}