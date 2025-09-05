import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TimeUtils } from '../../common/utils/time.utils';
import { UnavailableWindow } from './entities/unavailable-window.entity';
import { CreateUnavailableWindowDto } from './dto/create-unavailable-window.dto';
import { UpdateUnavailableWindowDto } from './dto/update-unavailable-window.dto';
import { UnavailableWindowResponseDto } from './dto/unavailable-window-response.dto';

@Injectable()
export class AdminUnavailableService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateUnavailableWindowDto): Promise<UnavailableWindowResponseDto> {
    this.validateScope(dto.weekday, dto.date);
    this.validateTimes(dto.startTime, dto.endTime);

    const scopeWhere = dto.date ? { date: TimeUtils.parseDate(dto.date) } : { weekday: dto.weekday };
    const existing = await this.em.find(UnavailableWindow, scopeWhere);

    const start = TimeUtils.timeToMinutes(dto.startTime);
    const end = TimeUtils.timeToMinutes(dto.endTime);
    if (existing.some(w => this.overlaps(start, end, w))) {
      throw new ConflictException('An overlapping unavailable window already exists for this scope');
    }

    const window = new UnavailableWindow({
      weekday: dto.weekday,
      date: dto.date ? TimeUtils.parseDate(dto.date) : undefined,
      startTime: dto.startTime,
      endTime: dto.endTime,
      note: dto.note,
    });

    await this.em.persistAndFlush(window);
    return this.toDto(window);
  }

  async list(): Promise<UnavailableWindowResponseDto[]> {
    const rows = await this.em.find(UnavailableWindow, {}, { orderBy: { weekday: 'ASC', date: 'ASC', startTime: 'ASC' } });
    return rows.map(w => this.toDto(w));
  }

  async update(id: string, dto: UpdateUnavailableWindowDto): Promise<UnavailableWindowResponseDto> {
    const window = await this.em.findOne(UnavailableWindow, { id });
    if (!window) throw new NotFoundException('Unavailable window not found');

    const next = { ...window, ...dto } as UnavailableWindow;

    this.validateScope(next.weekday, next.date ? TimeUtils.formatDate(next.date) : undefined);
    if (dto.startTime || dto.endTime) {
      const st = dto.startTime ?? window.startTime;
      const et = dto.endTime ?? window.endTime;
      this.validateTimes(st, et);
    }

    const scopeWhere = next.date ? { date: next.date } : { weekday: next.weekday };
    const others = await this.em.find(UnavailableWindow, scopeWhere);
    const start = TimeUtils.timeToMinutes(next.startTime);
    const end = TimeUtils.timeToMinutes(next.endTime);
    if (others.some(w => w.id !== window.id && this.overlaps(start, end, w))) {
      throw new ConflictException('An overlapping unavailable window already exists for this scope');
    }

    Object.assign(window, dto);
    await this.em.persistAndFlush(window);
    return this.toDto(window);
  }

  async remove(id: string): Promise<void> {
    const window = await this.em.findOne(UnavailableWindow, { id });
    if (!window) throw new NotFoundException('Unavailable window not found');
    await this.em.removeAndFlush(window);
  }

  private validateScope(weekday?: number, dateStr?: string) {
    if (!weekday && !dateStr) {
      throw new BadRequestException('Provide either weekday (1..7) or date (YYYY-MM-DD)');
    }
  }

  private validateTimes(startTime: string, endTime: string) {
    const s = TimeUtils.timeToMinutes(startTime);
    const e = TimeUtils.timeToMinutes(endTime);
    if (s >= e) throw new BadRequestException('startTime must be before endTime');
  }

  private overlaps(start: number, end: number, w: UnavailableWindow): boolean {
    const ws = TimeUtils.timeToMinutes(w.startTime);
    const we = TimeUtils.timeToMinutes(w.endTime);
    return start < we && end > ws;
  }

  private toDto(w: UnavailableWindow): UnavailableWindowResponseDto {
    return {
      id: w.id,
      weekday: w.weekday,
      date: w.date ? TimeUtils.formatDate(w.date) : undefined,
      startTime: TimeUtils.formatTime(w.startTime),
      endTime: TimeUtils.formatTime(w.endTime),
      note: w.note,
      createdAt: w.createdAt,
    };
  }
}
