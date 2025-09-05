import { ApiProperty } from '@nestjs/swagger';

export class AppointmentResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({ example: '2025-01-15' })
  date!: string;

  @ApiProperty({ example: '14:30' })
  startTime!: string;

  @ApiProperty({ example: 2, description: 'Number of slots booked' })
  slotCount!: number;

  @ApiProperty({ example: 'John Doe', nullable: true })
  customerName?: string;

  @ApiProperty({ example: 'john@example.com', nullable: true })
  customerEmail?: string;

  @ApiProperty({ description: 'When the appointment was created' })
  createdAt!: Date;
}
