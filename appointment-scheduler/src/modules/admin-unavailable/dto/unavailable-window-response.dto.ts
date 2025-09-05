import { ApiProperty } from '@nestjs/swagger';

export class UnavailableWindowResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 3, nullable: true })
  weekday?: number;

  @ApiProperty({ example: '2025-01-16', nullable: true })
  date?: string;

  @ApiProperty({ example: '12:30' })
  startTime!: string;

  @ApiProperty({ example: '13:30' })
  endTime!: string;

  @ApiProperty({ example: 'Lunch', nullable: true })
  note?: string;

  @ApiProperty()
  createdAt!: Date;
}
