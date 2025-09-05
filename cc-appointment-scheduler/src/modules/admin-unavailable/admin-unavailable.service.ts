import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { UnavailableWindow } from './entities/unavailable-window.entity';
import { CreateUnavailableWindowDto } from './dto/create-unavailable-window.dto';
import { UpdateUnavailableWindowDto } from './dto/update-unavailable-window.dto';
import { TimeUtils } from '../../common/utils/time.utils';

@Injectable()
export class AdminUnavailableService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateUnavailableWindowDto): Promise<UnavailableWindow> {
    if (dto.weekday && dto.date) {
      throw new BadRequestException('Cannot specify both weekday and date');
    }

    if (!dto.weekday && !dto.date) {
      throw new BadRequestException('Must specify either weekday or date');
    }

    const startMinutes = TimeUtils.timeToMinutes(dto.startTime);
    const endMinutes = TimeUtils.timeToMinutes(dto.endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Start time must be before end time');
    }

    const window = new UnavailableWindow({
      weekday: dto.weekday,
      date: dto.date ? TimeUtils.parseDate(dto.date) : undefined,
      startTime: dto.startTime,
      endTime: dto.endTime,
      note: dto.note,
    });

    await this.em.persistAndFlush(window);
    return window;
  }

  async findAll(): Promise<UnavailableWindow[]> {
    return await this.em.find(
      UnavailableWindow,
      {},
      { orderBy: { weekday: 'ASC', date: 'ASC', startTime: 'ASC' } },
    );
  }

  async findOne(id: string): Promise<UnavailableWindow> {
    const window = await this.em.findOne(UnavailableWindow, { id });
    if (!window) {
      throw new NotFoundException('Unavailable window not found');
    }
    return window;
  }

  async update(id: string, dto: UpdateUnavailableWindowDto): Promise<UnavailableWindow> {
    const window = await this.findOne(id);

    if (dto.weekday !== undefined && dto.date !== undefined) {
      throw new BadRequestException('Cannot specify both weekday and date');
    }

    if (dto.weekday !== undefined) {
      window.weekday = dto.weekday;
      window.date = undefined;
    }

    if (dto.date !== undefined) {
      window.date = dto.date ? TimeUtils.parseDate(dto.date) : undefined;
      window.weekday = undefined;
    }

    if (dto.startTime !== undefined) {
      window.startTime = dto.startTime;
    }

    if (dto.endTime !== undefined) {
      window.endTime = dto.endTime;
    }

    if (window.startTime && window.endTime) {
      const startMinutes = TimeUtils.timeToMinutes(window.startTime);
      const endMinutes = TimeUtils.timeToMinutes(window.endTime);
      if (startMinutes >= endMinutes) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    if (dto.note !== undefined) {
      window.note = dto.note;
    }

    await this.em.flush();
    return window;
  }

  async remove(id: string): Promise<void> {
    const window = await this.findOne(id);
    await this.em.removeAndFlush(window);
  }
}