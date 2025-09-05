import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AppConfig } from './entities/app-config.entity';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigResponseDto } from './dto/config-response.dto';
import { TimeUtils } from '../../common/utils/time.utils';

// Ensures there is exactly one AppConfig row (creates default if none).
// Validates operational time window via TimeUtils.timeToMinutes.
// Uses env fallbacks in getEffectiveConfig() if DB is empty.
// Uses em.find(AppConfig,{}) and picks the first record (avoids MikroORM “empty where” error).


@Injectable()
export class ConfigService {
  constructor(private readonly em: EntityManager) { }

  async getConfig(): Promise<ConfigResponseDto> {
    // Get the first (and should be only) config record
    // let config = await this.em.findOne(AppConfig, {});
    const configs = await this.em.find(AppConfig, {});
    let config = configs.length > 0 ? configs[0] : null;

    // If no config exists, create default one
    if (!config) {
      config = new AppConfig();
      await this.em.persistAndFlush(config);
    }

    return {
      slotDurationMinutes: config.slotDurationMinutes,
      maxSlotsPerAppointment: config.maxSlotsPerAppointment,
      operationalDays: config.operationalDays,
      operationalStartTime: config.operationalStartTime,
      operationalEndTime: config.operationalEndTime,
      updatedAt: config.updatedAt,
    };
  }

  async updateConfig(updateDto: UpdateConfigDto): Promise<ConfigResponseDto> {
    // Validation: start time must be before end time
    if (updateDto.operationalStartTime && updateDto.operationalEndTime) {
      const startMinutes = TimeUtils.timeToMinutes(updateDto.operationalStartTime);
      const endMinutes = TimeUtils.timeToMinutes(updateDto.operationalEndTime);

      if (startMinutes >= endMinutes) {
        throw new BadRequestException('Operational start time must be before end time');
      }
    }

    // let config = await this.em.findOne(AppConfig, {});
    const configs = await this.em.find(AppConfig, {});
    let config = configs.length > 0 ? configs[0] : null;

    if (!config) {
      // Create new config if none exists
      config = new AppConfig();
    }

    // Update only provided fields
    Object.assign(config, updateDto);

    await this.em.persistAndFlush(config);

    return {
      slotDurationMinutes: config.slotDurationMinutes,
      maxSlotsPerAppointment: config.maxSlotsPerAppointment,
      operationalDays: config.operationalDays,
      operationalStartTime: config.operationalStartTime,
      operationalEndTime: config.operationalEndTime,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Get effective config (used by other services)
   * Falls back to environment variables if database is empty
   */
  async getEffectiveConfig(): Promise<AppConfig> {
    // let config = await this.em.findOne(AppConfig, {});
    const configs = await this.em.find(AppConfig, {});
    let config = configs.length > 0 ? configs[0] : null;

    if (!config) {
      // Fallback to environment variables or defaults
      config = new AppConfig({
        slotDurationMinutes: process.env.SLOT_DURATION_MINUTES
          ? parseInt(process.env.SLOT_DURATION_MINUTES, 10)
          : 30,
        maxSlotsPerAppointment: process.env.MAX_SLOTS_PER_APPOINTMENT
          ? parseInt(process.env.MAX_SLOTS_PER_APPOINTMENT, 10)
          : 1,
        operationalDays: process.env.OPERATIONAL_DAYS
          ? process.env.OPERATIONAL_DAYS.split(',').map(Number)
          : [1, 2, 3, 4, 5],
        operationalStartTime: process.env.OPERATIONAL_START || '09:00',
        operationalEndTime: process.env.OPERATIONAL_END || '18:00',
      });

      await this.em.persistAndFlush(config);
    }

    return config;
  }
}
