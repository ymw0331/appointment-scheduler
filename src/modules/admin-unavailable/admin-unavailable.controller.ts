import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AdminUnavailableService } from './admin-unavailable.service';
import { CreateUnavailableWindowDto } from './dto/create-unavailable-window.dto';
import { UpdateUnavailableWindowDto } from './dto/update-unavailable-window.dto';
import { UnavailableWindowResponseDto } from './dto/unavailable-window-response.dto';

@ApiTags('Admin - Unavailable')
@Controller('admin/unavailable')
export class AdminUnavailableController {
  constructor(private readonly service: AdminUnavailableService) {}

  @Post()
  @ApiOperation({ summary: 'Create an unavailable window (weekday or date)' })
  @ApiResponse({ status: 201, type: UnavailableWindowResponseDto })
  async create(@Body() dto: CreateUnavailableWindowDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List unavailable windows' })
  @ApiResponse({ status: 200, type: [UnavailableWindowResponseDto] })
  async list() {
    return this.service.list();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an unavailable window' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: UnavailableWindowResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUnavailableWindowDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an unavailable window' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
