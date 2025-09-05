import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AdminDaysOffService } from './admin-days-off.service';
import { CreateDayOffDto } from './dto/create-day-off.dto';
import { UpdateDayOffDto } from './dto/update-day-off.dto';
import { DayOffResponseDto } from './dto/day-off-response.dto';

@ApiTags('Admin - Days Off')
@Controller('admin/days-off')
export class AdminDaysOffController {
  constructor(private readonly adminDaysOffService: AdminDaysOffService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Add a day off',
    description: 'Mark a specific date as unavailable for appointments (holiday, closure, etc.)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Day off created successfully',
    type: DayOffResponseDto
  })
  @ApiResponse({ status: 409, description: 'Day off already exists for this date' })
  async create(@Body() dto: CreateDayOffDto): Promise<DayOffResponseDto> {
    return this.adminDaysOffService.createDayOff(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all days off' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all days off',
    type: [DayOffResponseDto]
  })
  async getAll(): Promise<DayOffResponseDto[]> {
    return this.adminDaysOffService.getAllDaysOff();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a day off' })
  @ApiParam({ name: 'id', description: 'Day off ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Day off updated successfully',
    type: DayOffResponseDto
  })
  @ApiResponse({ status: 404, description: 'Day off not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDayOffDto
  ): Promise<DayOffResponseDto> {
    return this.adminDaysOffService.updateDayOff(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a day off' })
  @ApiParam({ name: 'id', description: 'Day off ID' })
  @ApiResponse({ status: 204, description: 'Day off removed successfully' })
  @ApiResponse({ status: 404, description: 'Day off not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.adminDaysOffService.deleteDayOff(id);
  }
}
