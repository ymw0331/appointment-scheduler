import { ApiProperty } from '@nestjs/swagger';
import { TimeUtils } from '../../../common/utils/time.utils';

export class UnavailableWindowResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 1, required: false })
  weekday?: number;

  @ApiProperty({ example: '2024-04-04', required: false })
  date?: string;

  @ApiProperty({ example: '12:30' })
  startTime: string;

  @ApiProperty({ example: '13:30' })
  endTime: string;

  @ApiProperty({ example: 'Lunch break', required: false })
  note?: string;

  @ApiProperty({ example: '2024-04-04T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-04-04T10:00:00Z' })
  updatedAt: Date;

  constructor(window: any) {
    this.id = window.id;
    this.weekday = window.weekday;
    this.date = window.date ? TimeUtils.formatDate(window.date) : undefined;
    this.startTime = window.startTime;
    this.endTime = window.endTime;
    this.note = window.note;
    this.createdAt = window.createdAt;
    this.updatedAt = window.updatedAt;
  }
}