import { ApiProperty } from '@nestjs/swagger';
import { TimeUtils } from '../../../common/utils/time.utils';

export class DayOffResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '2024-12-25' })
  date: string;

  @ApiProperty({ example: 'Christmas Day', required: false })
  note?: string;

  @ApiProperty({ example: '2024-04-04T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-04-04T10:00:00Z' })
  updatedAt: Date;

  constructor(dayOff: any) {
    this.id = dayOff.id;
    this.date = TimeUtils.formatDate(dayOff.date);
    this.note = dayOff.note;
    this.createdAt = dayOff.createdAt;
    this.updatedAt = dayOff.updatedAt;
  }
}