import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AdminDaysOffController } from './admin-days-off.controller';
import { AdminDaysOffService } from './admin-days-off.service';
import { DayOff } from './entities/day-off.entity';

@Module({
  imports: [MikroOrmModule.forFeature([DayOff])],
  controllers: [AdminDaysOffController],
  providers: [AdminDaysOffService],
  exports: [AdminDaysOffService],
})
export class AdminDaysOffModule {}