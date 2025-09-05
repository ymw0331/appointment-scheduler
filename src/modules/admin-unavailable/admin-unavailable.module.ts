import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AdminUnavailableService } from './admin-unavailable.service';
import { AdminUnavailableController } from './admin-unavailable.controller';
import { UnavailableWindow } from './entities/unavailable-window.entity';

@Module({
  imports: [MikroOrmModule.forFeature([UnavailableWindow])],
  controllers: [AdminUnavailableController],
  providers: [AdminUnavailableService],
})
export class AdminUnavailableModule {}