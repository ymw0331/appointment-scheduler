import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { AvailabilitySlotDto } from './dto/availability-slot.dto';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get available appointment slots for a specific date' })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
    example: '2024-04-04',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available slots',
    type: [AvailabilitySlotDto],
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format',
  })
  async getAvailability(@Query('date') date: string): Promise<AvailabilitySlotDto[]> {
    if (!date) {
      throw new BadRequestException('Date parameter is required');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    try {
      return await this.availabilityService.getAvailability(date);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(`Invalid date: ${error.message}`);
      }
      throw error;
    }
  }
}