import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotDto {
  @ApiProperty({ example: '2025-01-15' })
  date!: string;

  @ApiProperty({ example: '09:00' })
  time!: string;

  @ApiProperty({ example: 1, description: '0 = not available, 1 = available' })
  available_slots!: number;
}
