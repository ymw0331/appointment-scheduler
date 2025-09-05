import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GetAvailabilityQueryDto {
  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  date!: string;
}
