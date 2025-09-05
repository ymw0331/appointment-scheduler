import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AdminDaysOffService } from './admin-days-off.service';
import { AdminDaysOffController } from './admin-days-off.controller';
import { DayOff } from './entities/day-off.entity';

@Module({
  imports: [MikroOrmModule.forFeature([DayOff])],
  providers: [AdminDaysOffService],
  controllers: [AdminDaysOffController],
})
export class AdminDaysOffModule {}