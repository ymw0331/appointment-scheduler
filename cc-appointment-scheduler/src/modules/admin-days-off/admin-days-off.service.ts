import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { DayOff } from './entities/day-off.entity';
import { CreateDayOffDto } from './dto/create-day-off.dto';
import { UpdateDayOffDto } from './dto/update-day-off.dto';
import { TimeUtils } from '../../common/utils/time.utils';

@Injectable()
export class AdminDaysOffService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateDayOffDto): Promise<DayOff> {
    const date = TimeUtils.parseDate(dto.date);
    
    const existing = await this.em.findOne(DayOff, { date });
    if (existing) {
      throw new ConflictException('Day off already exists for this date');
    }

    const dayOff = new DayOff({
      date,
      note: dto.note,
    });

    await this.em.persistAndFlush(dayOff);
    return dayOff;
  }

  async findAll(): Promise<DayOff[]> {
    return await this.em.find(DayOff, {}, { orderBy: { date: 'ASC' } });
  }

  async findOne(id: string): Promise<DayOff> {
    const dayOff = await this.em.findOne(DayOff, { id });
    if (!dayOff) {
      throw new NotFoundException('Day off not found');
    }
    return dayOff;
  }

  async update(id: string, dto: UpdateDayOffDto): Promise<DayOff> {
    const dayOff = await this.findOne(id);
    
    if (dto.date) {
      const newDate = TimeUtils.parseDate(dto.date);
      const existing = await this.em.findOne(DayOff, { date: newDate, id: { $ne: id } });
      if (existing) {
        throw new ConflictException('Day off already exists for this date');
      }
      dayOff.date = newDate;
    }

    if (dto.note !== undefined) {
      dayOff.note = dto.note;
    }

    await this.em.flush();
    return dayOff;
  }

  async remove(id: string): Promise<void> {
    const dayOff = await this.findOne(id);
    await this.em.removeAndFlush(dayOff);
  }
}