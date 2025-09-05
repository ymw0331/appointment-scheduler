import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetAppointmentsQueryDto {
  @ApiProperty({ 
    example: '2025-01-15', 
    description: 'Filter appointments by date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
