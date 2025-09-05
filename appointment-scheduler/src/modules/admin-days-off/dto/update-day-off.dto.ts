import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDayOffDto {
  @ApiProperty({ 
    example: 'Christmas Day (Updated)', 
    description: 'Update the note about the day off',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}