import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsInt, Min, Max, IsOptional, IsEmail, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2025-01-15', description: 'Appointment date in YYYY-MM-DD format' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: '14:30', description: 'Start time in HH:mm format, must align to slot grid' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: 'time must be in HH:mm format' 
  })
  time!: string;

  @ApiProperty({ 
    example: 2, 
    description: 'Number of consecutive slots to book (1-5)',
    minimum: 1,
    maximum: 5
  })
  @IsInt()
  @Min(1)
  @Max(5)
  slots!: number;

  @ApiProperty({ 
    example: 'John Doe', 
    description: 'Customer name (optional)',
    required: false
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ 
    example: 'john@example.com', 
    description: 'Customer email (optional)',
    required: false
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;
}
