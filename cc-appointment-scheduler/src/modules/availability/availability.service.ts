import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ConfigService } from '../config/config.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { DayOff } from '../admin-days-off/entities/day-off.entity';
import { UnavailableWindow } from '../admin-unavailable/entities/unavailable-window.entity';
import { TimeUtils } from '../../common/utils/time.utils';
import { AvailabilitySlotDto } from './dto/availability-slot.dto';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async getAvailability(dateStr: string): Promise<AvailabilitySlotDto[]> {
    const date = TimeUtils.parseDate(dateStr);
    const config = await this.configService.getEffectiveConfig();
    const dayOfWeek = TimeUtils.getDayOfWeek(date);

    if (!config.operationalDays.includes(dayOfWeek)) {
      return [];
    }

    const isDayOff = await this.em.findOne(DayOff, { date });
    if (isDayOff) {
      return [];
    }

    const slots = TimeUtils.generateSlotTimes(
      config.operationalStartTime,
      config.operationalEndTime,
      config.slotDurationMinutes,
    );

    const unavailableWindows = await this.getUnavailableWindows(date, dayOfWeek);

    const availableSlots = slots.filter((slotTime) => {
      return !this.isSlotInUnavailableWindow(
        slotTime,
        config.slotDurationMinutes,
        unavailableWindows,
      );
    });

    const appointments = await this.em.find(Appointment, {
      date,
      startTime: { $in: availableSlots },
    });

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
    return await this.em.find(UnavailableWindow, {
      $or: [
        { weekday: dayOfWeek, date: null },
        { date },
      ],
    });
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