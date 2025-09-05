import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsArray, ArrayMinSize, ArrayMaxSize, IsString, Matches } from 'class-validator';

export class UpdateConfigDto {
  @ApiProperty({
    description: 'Duration of each slot in minutes',
    minimum: 5,
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  slotDurationMinutes?: number;

  @ApiProperty({
    description: 'Maximum number of contiguous slots per appointment',
    minimum: 1,
    maximum: 5,
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxSlotsPerAppointment?: number;

  @ApiProperty({
    description: 'Operational days (1=Monday, 7=Sunday)',
    type: [Number],
    example: [1, 2, 3, 4, 5],
    required: false,
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
    description: 'Start time of operations (HH:mm format)',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:mm format',
  })
  operationalStartTime?: string;

  @ApiProperty({
    description: 'End time of operations (HH:mm format)',
    example: '18:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:mm format',
  })
  operationalEndTime?: string;
}