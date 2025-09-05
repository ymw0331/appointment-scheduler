import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Returns API health status, database connectivity, and system information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    example: {
      status: 'ok',
      timestamp: '2025-01-05T12:30:00.000Z',
      uptime: 120.5,
      database: {
        status: 'connected',
        version: 'PostgreSQL 16.1 on x86_64-pc-linux-gnu'
      },
      memory: {
        used: 45.2,
        total: 128.0
      },
      environment: 'development'
    }
  })
  async getHealth() {
    return await this.healthService.checkHealth();
  }
}