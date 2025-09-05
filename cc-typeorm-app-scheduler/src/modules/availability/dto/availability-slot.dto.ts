import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2024-04-04',
  })
  date: string;

  @ApiProperty({
    description: 'Time slot in HH:mm format',
    example: '10:00',
  })
  time: string;

  @ApiProperty({
    description: 'Number of available slots (0 = booked, 1 = available)',
    example: 1,
    minimum: 0,
    maximum: 1,
  })
  available_slots: number;
}