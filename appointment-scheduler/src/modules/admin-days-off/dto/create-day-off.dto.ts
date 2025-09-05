import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDayOffDto {
  @ApiProperty({ 
    example: '2025-12-25', 
    description: 'Date to mark as day off (YYYY-MM-DD)'
  })
  @IsDateString()
  date!: string;

  @ApiProperty({ 
    example: 'Christmas Day', 
    description: 'Optional note about the day off',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
