import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, Matches } from 'class-validator';

export class CreateUnavailableWindowDto {
  @ApiProperty({
    description: 'Day of week (1=Monday, 7=Sunday)',
    minimum: 1,
    maximum: 7,
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  weekday?: number;

  @ApiProperty({
    description: 'Specific date in YYYY-MM-DD format',
    example: '2024-04-04',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date?: string;

  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '12:30',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:mm format',
  })
  startTime!: string;

  @ApiProperty({
    description: 'End time in HH:mm format',
    example: '13:30',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:mm format',
  })
  endTime!: string;

  @ApiProperty({
    description: 'Optional note about the unavailable window',
    example: 'Lunch break',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}