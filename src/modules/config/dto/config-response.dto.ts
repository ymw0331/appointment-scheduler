import { ApiProperty } from '@nestjs/swagger';

// Swagger response shape.
export class ConfigResponseDto {
  @ApiProperty({ example: 30, description: 'Duration of each appointment slot in minutes' })
  slotDurationMinutes: number;

  @ApiProperty({ example: 1, description: 'Maximum number of slots per appointment (1-5)' })
  maxSlotsPerAppointment: number;

  @ApiProperty({ example: [1, 2, 3, 4, 5], description: 'Operational days (1=Monday, 7=Sunday)' })
  operationalDays: number[];

  @ApiProperty({ example: '09:00', description: 'Start of operational hours (HH:mm)' })
  operationalStartTime: string;

  @ApiProperty({ example: '18:00', description: 'End of operational hours (HH:mm)' })
  operationalEndTime: string;

  @ApiProperty({ description: 'When this configuration was last updated' })
  updatedAt: Date;
}