import { ApiProperty } from '@nestjs/swagger';

export class ConfigResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 30 })
  slotDurationMinutes!: number;

  @ApiProperty({ example: 1 })
  maxSlotsPerAppointment!: number;

  @ApiProperty({ example: [1, 2, 3, 4, 5] })
  operationalDays!: number[];

  @ApiProperty({ example: '09:00' })
  operationalStartTime!: string;

  @ApiProperty({ example: '18:00' })
  operationalEndTime!: string;

  @ApiProperty({ example: '2024-04-04T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-04-04T10:30:00Z' })
  updatedAt!: Date;

  constructor(partial: Partial<ConfigResponseDto>) {
    Object.assign(this, partial);
  }
}