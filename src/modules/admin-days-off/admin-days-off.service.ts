import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TimeUtils } from '../../common/utils/time.utils';
import { DayOff } from './entities/day-off.entity';
import { CreateDayOffDto } from './dto/create-day-off.dto';
import { UpdateDayOffDto } from './dto/update-day-off.dto';
import { DayOffResponseDto } from './dto/day-off-response.dto';

@Injectable()
export class AdminDaysOffService {
  constructor(private readonly em: EntityManager) {}

  async createDayOff(dto: CreateDayOffDto): Promise<DayOffResponseDto> {
    const date = TimeUtils.parseDate(dto.date);

    // Check if day off already exists for this date
    const existing = await this.em.findOne(DayOff, { date });
    if (existing) {
      throw new ConflictException(`Day off already exists for ${dto.date}`);
    }

    const dayOff = new DayOff({
      date,
      note: dto.note,
    });

    await this.em.persistAndFlush(dayOff);
    return this.toResponseDto(dayOff);
  }

  async getAllDaysOff(): Promise<DayOffResponseDto[]> {
    const daysOff = await this.em.find(DayOff, {}, { 
      orderBy: { date: 'ASC' } 
    });
    
    return daysOff.map(dayOff => this.toResponseDto(dayOff));
  }

  async updateDayOff(id: string, dto: UpdateDayOffDto): Promise<DayOffResponseDto> {
    const dayOff = await this.em.findOne(DayOff, { id });
    
    if (!dayOff) {
      throw new NotFoundException(`Day off with ID ${id} not found`);
    }

    if (dto.note !== undefined) {
      dayOff.note = dto.note;
    }

    await this.em.persistAndFlush(dayOff);
    return this.toResponseDto(dayOff);
  }

  async deleteDayOff(id: string): Promise<void> {
    const dayOff = await this.em.findOne(DayOff, { id });
    
    if (!dayOff) {
      throw new NotFoundException(`Day off with ID ${id} not found`);
    }

    await this.em.removeAndFlush(dayOff);
  }

  private toResponseDto(dayOff: DayOff): DayOffResponseDto {
    return {
      id: dayOff.id,
      date: TimeUtils.formatDate(dayOff.date),
      note: dayOff.note,
      createdAt: dayOff.createdAt,
    };
  }
}
