import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfig } from '@entities/app-config.entity';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private cachedConfig: AppConfig | null = null;

  constructor(
    @InjectRepository(AppConfig)
    private readonly configRepository: Repository<AppConfig>,
    private readonly nestConfigService: NestConfigService,
  ) {}

  async getEffectiveConfig(): Promise<AppConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    let config = await this.configRepository.findOne({ where: {} });
    
    if (!config) {
      config = await this.createDefaultConfig();
    }

    const envOverrides = this.getEnvOverrides();
    config = { ...config, ...envOverrides };

    this.cachedConfig = config;
    return config;
  }

  async updateConfig(updates: Partial<AppConfig>): Promise<AppConfig> {
    let config = await this.configRepository.findOne({ where: {} });
    
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
    await this.configRepository.save(config);
    
    this.cachedConfig = null;
    this.logger.log('Configuration updated successfully');
    
    return config;
  }

  private async createDefaultConfig(): Promise<AppConfig> {
    const config = this.configRepository.create({
      slotDurationMinutes: 30,
      maxSlotsPerAppointment: 1,
      operationalDays: [1, 2, 3, 4, 5],
      operationalStartTime: '09:00',
      operationalEndTime: '18:00',
    });
    
    await this.configRepository.save(config);
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