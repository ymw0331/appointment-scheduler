import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './modules/config/config.module';
import { HealthModule } from './modules/health/health.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AdminDaysOffModule } from './modules/admin-days-off/admin-days-off.module';
import { AdminUnavailableModule } from './modules/admin-unavailable/admin-unavailable.module';
import mikroOrmConfig from './mikro-orm.config';


//  imports Nest ConfigModule, MikroORM root, and our ConfigModule.

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    ConfigModule,
    HealthModule,
    AvailabilityModule,
    AppointmentsModule,
    AdminDaysOffModule,
    AdminUnavailableModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
