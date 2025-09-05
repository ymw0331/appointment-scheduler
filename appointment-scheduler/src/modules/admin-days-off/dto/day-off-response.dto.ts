import { ApiProperty } from '@nestjs/swagger';

export class DayOffResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({ example: '2025-12-25' })
  date!: string;

  @ApiProperty({ example: 'Christmas Day', nullable: true })
  note?: string;

  @ApiProperty({ description: 'When this day off was created' })
  createdAt!: Date;
}
