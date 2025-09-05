import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsDateString, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateUnavailableWindowDto {
  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  weekday?: number;

  @ApiProperty({ example: '2025-01-16', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: '12:30', required: false })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be HH:mm' })
  startTime?: string;

  @ApiProperty({ example: '13:30', required: false })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be HH:mm' })
  endTime?: string;

  @ApiProperty({ example: 'Team lunch', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
