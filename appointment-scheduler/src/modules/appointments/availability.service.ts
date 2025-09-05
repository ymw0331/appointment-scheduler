import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '../config/config.service';
import { TimeUtils } from '../../common/utils/time.utils';
import { AvailabilitySlotDto } from './dto/availability-slot.dto';
import { Appointment } from './entities/appointment.entity';
import { DayOff } from '../admin-days-off/entities/day-off.entity';
import { UnavailableWindow } from '../admin-unavailable/entities/unavailable-window.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async getAvailability(dateStr: string): Promise<AvailabilitySlotDto[]> {
    const date = TimeUtils.parseDate(dateStr);
    const cfg = await this.configService.getEffectiveConfig();

    // 1) Not an operational day → empty
    const weekday = TimeUtils.getDayOfWeek(date);
    // console.log(`Date: ${dateStr}, parsed: ${date}, weekday: ${weekday}, operational: ${cfg.operationalDays}`);


    // if (!cfg.operationalDays.includes(weekday)) return [];
    const operationalDaysNumbers = cfg.operationalDays.map(d => typeof d === 'string' ? parseInt(d, 10) : d);
if (!operationalDaysNumbers.includes(weekday)) return [];

    // 2) Day off → empty
    const dayOff = await this.em.findOne(DayOff, { date });
    if (dayOff) return [];

    // 3) Unavailable windows (weekday-based or specific date)
    const unavailable = await this.em.find(UnavailableWindow, {
      $or: [{ weekday }, { date }],
    });

    // 4) All appointments for the date (to detect collisions)
    const appointments = await this.em.find(Appointment, { date });

    // Precompute appointment ranges in minutes
    const apptRanges = appointments.map((a) => {
      const start = TimeUtils.timeToMinutes(a.startTime);
      const end = start + cfg.slotDurationMinutes * a.slotCount;
      return { start, end };
    });

    // Generate slot grid
    const slotTimes = TimeUtils.generateSlotTimes(
      cfg.operationalStartTime,
      cfg.operationalEndTime,
      cfg.slotDurationMinutes,
    );

    // Helper: check overlap with unavailable windows
    const slotAvailable = (slotStartMin: number): boolean => {
      const slotEndMin = slotStartMin + cfg.slotDurationMinutes;

      // Unavailable windows
      for (const w of unavailable) {
        const ws = TimeUtils.timeToMinutes(w.startTime);
        const we = TimeUtils.timeToMinutes(w.endTime);
        if (slotStartMin < we && slotEndMin > ws) return false;
      }

      // Appointments overlap
      for (const r of apptRanges) {
        if (slotStartMin < r.end && slotEndMin > r.start) return false;
      }

      return true;
    };

    return slotTimes.map((time) => {
      const startMin = TimeUtils.timeToMinutes(time);
      const ok = slotAvailable(startMin);
      return { date: dateStr, time, available_slots: ok ? 1 : 0 };
    });
  }
}
