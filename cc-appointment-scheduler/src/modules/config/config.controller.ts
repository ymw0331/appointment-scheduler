import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ConfigResponseDto } from './dto/config-response.dto';

@ApiTags('Config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get current configuration' })
  @ApiResponse({
    status: 200,
    description: 'Current configuration',
    type: ConfigResponseDto,
  })
  async getConfig(): Promise<ConfigResponseDto> {
    const config = await this.configService.getEffectiveConfig();
    return new ConfigResponseDto(config);
  }

  @Put()
  @ApiOperation({ summary: 'Update configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
    type: ConfigResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration values',
  })
  async updateConfig(@Body() updateDto: UpdateConfigDto): Promise<ConfigResponseDto> {
    const config = await this.configService.updateConfig(updateDto);
    return new ConfigResponseDto(config);
  }
}