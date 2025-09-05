import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsArray, IsString, Matches, ArrayMinSize, ArrayMaxSize, IsOptional } from 'class-validator';

export class UpdateConfigDto {
  @ApiProperty({ 
    example: 30, 
    description: 'Duration of each appointment slot in minutes (5-60)',
    minimum: 5,
    maximum: 60,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  slotDurationMinutes?: number;

  @ApiProperty({ 
    example: 2, 
    description: 'Maximum number of slots per appointment',
    minimum: 1,
    maximum: 5,
    required: false 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxSlotsPerAppointment?: number;

  @ApiProperty({ 
    example: [1, 2, 3, 4, 5], 
    description: 'Operational days (1=Monday, 7=Sunday)',
    type: [Number],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  operationalDays?: number[];

  @ApiProperty({ 
    example: '09:00', 
    description: 'Start of operational hours (HH:mm format)',
    required: false 
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: 'operationalStartTime must be in HH:mm format' 
  })
  operationalStartTime?: string;

  @ApiProperty({ 
    example: '18:00', 
    description: 'End of operational hours (HH:mm format)',
    required: false 
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: 'operationalEndTime must be in HH:mm format' 
  })
  operationalEndTime?: string;
}