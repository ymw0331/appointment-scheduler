import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminDaysOffService } from './admin-days-off.service';
import { CreateDayOffDto } from './dto/create-day-off.dto';
import { UpdateDayOffDto } from './dto/update-day-off.dto';
import { DayOffResponseDto } from './dto/day-off-response.dto';

@ApiTags('Admin - Days Off')
@Controller('admin/days-off')
export class AdminDaysOffController {
  constructor(private readonly adminDaysOffService: AdminDaysOffService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new day off' })
  @ApiResponse({
    status: 201,
    description: 'Day off created successfully',
    type: DayOffResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Day off already exists for this date',
  })
  async create(@Body() dto: CreateDayOffDto): Promise<DayOffResponseDto> {
    const dayOff = await this.adminDaysOffService.create(dto);
    return new DayOffResponseDto(dayOff);
  }

  @Get()
  @ApiOperation({ summary: 'Get all days off' })
  @ApiResponse({
    status: 200,
    description: 'List of days off',
    type: [DayOffResponseDto],
    isArray: true,
  })
  async findAll(): Promise<DayOffResponseDto[]> {
    const daysOff = await this.adminDaysOffService.findAll();
    return daysOff.map((d) => new DayOffResponseDto(d));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific day off' })
  @ApiResponse({
    status: 200,
    description: 'Day off details',
    type: DayOffResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Day off not found',
  })
  async findOne(@Param('id') id: string): Promise<DayOffResponseDto> {
    const dayOff = await this.adminDaysOffService.findOne(id);
    return new DayOffResponseDto(dayOff);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a day off' })
  @ApiResponse({
    status: 200,
    description: 'Day off updated successfully',
    type: DayOffResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Day off not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Day off already exists for this date',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDayOffDto,
  ): Promise<DayOffResponseDto> {
    const dayOff = await this.adminDaysOffService.update(id, dto);
    return new DayOffResponseDto(dayOff);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a day off' })
  @ApiResponse({
    status: 200,
    description: 'Day off deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Day off not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.adminDaysOffService.remove(id);
  }
}