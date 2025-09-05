import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { AppConfig } from './entities/app-config.entity';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private cachedConfig: AppConfig | null = null;

  constructor(
    private readonly em: EntityManager,
    private readonly nestConfigService: NestConfigService,
  ) {}

  async getEffectiveConfig(): Promise<AppConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    let config = await this.em.findOne(AppConfig, {});
    
    if (!config) {
      config = await this.createDefaultConfig();
    }

    const envOverrides = this.getEnvOverrides();
    config = { ...config, ...envOverrides };

    this.cachedConfig = config;
    return config;
  }

  async updateConfig(updates: Partial<AppConfig>): Promise<AppConfig> {
    let config = await this.em.findOne(AppConfig, {});
    
    if (!config) {
      config = await this.createDefaultConfig();
    }

    if (updates.slotDurationMinutes !== undefined && updates.slotDurationMinutes < 5) {
      throw new Error('Slot duration must be at least 5 minutes');
    }

    if (updates.maxSlotsPerAppointment !== undefined) {
      if (updates.maxSlotsPerAppointment < 1 || updates.maxSlotsPerAppointment > 5) {
        throw new Error('Max slots per appointment must be between 1 and 5');
      }
    }

    Object.assign(config, updates);
    await this.em.persistAndFlush(config);
    
    this.cachedConfig = null;
    this.logger.log('Configuration updated successfully');
    
    return config;
  }

  private async createDefaultConfig(): Promise<AppConfig> {
    const config = new AppConfig();
    config.slotDurationMinutes = 30;
    config.maxSlotsPerAppointment = 1;
    config.operationalDays = [1, 2, 3, 4, 5];
    config.operationalStartTime = '09:00';
    config.operationalEndTime = '18:00';
    
    await this.em.persistAndFlush(config);
    this.logger.log('Default configuration created');
    
    return config;
  }

  private getEnvOverrides(): Partial<AppConfig> {
    const overrides: Partial<AppConfig> = {};

    const slotDuration = this.nestConfigService.get<number>('SLOT_DURATION_MINUTES');
    if (slotDuration) {
      overrides.slotDurationMinutes = slotDuration;
    }

    const maxSlots = this.nestConfigService.get<number>('MAX_SLOTS_PER_APPOINTMENT');
    if (maxSlots) {
      overrides.maxSlotsPerAppointment = maxSlots;
    }

    const operationalDays = this.nestConfigService.get<string>('OPERATIONAL_DAYS');
    if (operationalDays) {
      overrides.operationalDays = operationalDays.split(',').map(Number);
    }

    const startTime = this.nestConfigService.get<string>('OPERATIONAL_START');
    if (startTime) {
      overrides.operationalStartTime = startTime;
    }

    const endTime = this.nestConfigService.get<string>('OPERATIONAL_END');
    if (endTime) {
      overrides.operationalEndTime = endTime;
    }

    return overrides;
  }

  clearCache(): void {
    this.cachedConfig = null;
  }
}