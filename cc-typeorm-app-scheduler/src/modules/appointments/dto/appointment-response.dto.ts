import { ApiProperty } from '@nestjs/swagger';
import { TimeUtils } from '@common/utils/time.utils';

export class AppointmentResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '2024-04-04' })
  date: string;

  @ApiProperty({ example: '10:00' })
  startTime: string;

  @ApiProperty({ example: 1 })
  slotCount: number;

  @ApiProperty({ example: 'John Doe', required: false })
  customerName?: string;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  customerEmail?: string;

  @ApiProperty({ example: '2024-04-04T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-04-04T10:00:00Z' })
  updatedAt: Date;

  constructor(appointment: any) {
    this.id = appointment.id;
    this.date = TimeUtils.formatDate(appointment.date);
    this.startTime = appointment.startTime;
    this.slotCount = appointment.slotCount;
    this.customerName = appointment.customerName;
    this.customerEmail = appointment.customerEmail;
    this.createdAt = appointment.createdAt;
    this.updatedAt = appointment.updatedAt;
  }
}