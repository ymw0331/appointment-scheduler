import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ConfigResponseDto } from './dto/config-response.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

// GET /config: returns the current effective config.
// PUT /config: updates any subset of fields with validation (DTO). Swagger metadata included.

@ApiTags('Config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) { }

  @Get()
  @ApiOperation({ summary: 'Get current configuration' })
  @ApiResponse({
    status: 200,
    description: 'Current system configuration',
    type: ConfigResponseDto
  })
  async getConfig(): Promise<ConfigResponseDto> {
    return this.configService.getConfig();
  }

  @Put()
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
    type: ConfigResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration data'
  })
  async updateConfig(@Body() updateDto: UpdateConfigDto): Promise<ConfigResponseDto> {
    return this.configService.updateConfig(updateDto);
  }
}
