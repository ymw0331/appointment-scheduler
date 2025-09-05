import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateDayOffDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2024-12-25',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date?: string;

  @ApiProperty({
    description: 'Optional note about the day off',
    example: 'Christmas Day',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}