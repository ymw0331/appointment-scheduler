import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { Appointment } from '@entities/appointment.entity';
import { DayOff } from '@entities/day-off.entity';
import { UnavailableWindow } from '@entities/unavailable-window.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, DayOff, UnavailableWindow]),
    ConfigModule,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}