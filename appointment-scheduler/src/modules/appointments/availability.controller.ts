import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { GetAvailabilityQueryDto } from './dto/get-availability.dto';
import { AvailabilitySlotDto } from './dto/availability-slot.dto';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get availability for a date' })
  @ApiResponse({
    status: 200,
    description: 'Array of slots with availability',
    type: [AvailabilitySlotDto],
  })
  async get(@Query() q: GetAvailabilityQueryDto): Promise<AvailabilitySlotDto[]> {
    return this.availabilityService.getAvailability(q.date);
  }
}
