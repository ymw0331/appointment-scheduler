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
import { AdminUnavailableService } from './admin-unavailable.service';
import { CreateUnavailableWindowDto } from './dto/create-unavailable-window.dto';
import { UpdateUnavailableWindowDto } from './dto/update-unavailable-window.dto';
import { UnavailableWindowResponseDto } from './dto/unavailable-window-response.dto';

@ApiTags('Admin - Unavailable')
@Controller('admin/unavailable')
export class AdminUnavailableController {
  constructor(private readonly adminUnavailableService: AdminUnavailableService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new unavailable window' })
  @ApiResponse({
    status: 201,
    description: 'Unavailable window created successfully',
    type: UnavailableWindowResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() dto: CreateUnavailableWindowDto): Promise<UnavailableWindowResponseDto> {
    const window = await this.adminUnavailableService.create(dto);
    return new UnavailableWindowResponseDto(window);
  }

  @Get()
  @ApiOperation({ summary: 'Get all unavailable windows' })
  @ApiResponse({
    status: 200,
    description: 'List of unavailable windows',
    type: [UnavailableWindowResponseDto],
    isArray: true,
  })
  async findAll(): Promise<UnavailableWindowResponseDto[]> {
    const windows = await this.adminUnavailableService.findAll();
    return windows.map((w) => new UnavailableWindowResponseDto(w));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific unavailable window' })
  @ApiResponse({
    status: 200,
    description: 'Unavailable window details',
    type: UnavailableWindowResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Unavailable window not found',
  })
  async findOne(@Param('id') id: string): Promise<UnavailableWindowResponseDto> {
    const window = await this.adminUnavailableService.findOne(id);
    return new UnavailableWindowResponseDto(window);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an unavailable window' })
  @ApiResponse({
    status: 200,
    description: 'Unavailable window updated successfully',
    type: UnavailableWindowResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Unavailable window not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUnavailableWindowDto,
  ): Promise<UnavailableWindowResponseDto> {
    const window = await this.adminUnavailableService.update(id, dto);
    return new UnavailableWindowResponseDto(window);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an unavailable window' })
  @ApiResponse({
    status: 200,
    description: 'Unavailable window deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Unavailable window not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.adminUnavailableService.remove(id);
  }
}