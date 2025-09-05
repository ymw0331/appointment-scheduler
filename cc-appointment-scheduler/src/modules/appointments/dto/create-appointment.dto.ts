import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsEmail, IsOptional, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Appointment date in YYYY-MM-DD format',
    example: '2024-04-04',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date!: string;

  @ApiProperty({
    description: 'Appointment start time in HH:mm format',
    example: '10:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:mm format',
  })
  time!: string;

  @ApiProperty({
    description: 'Number of contiguous slots to book',
    minimum: 1,
    maximum: 5,
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  slots!: number;

  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;
}