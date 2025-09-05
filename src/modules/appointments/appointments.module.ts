import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { DayOff } from '../admin-days-off/entities/day-off.entity';
import { UnavailableWindow } from '../admin-unavailable/entities/unavailable-window.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Appointment, DayOff, UnavailableWindow]),
    ConfigModule,
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}