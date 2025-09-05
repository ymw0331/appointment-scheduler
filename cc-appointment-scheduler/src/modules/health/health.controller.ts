import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/postgresql';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly em: EntityManager) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'connected' },
        timestamp: { type: 'string', example: '2024-04-04T10:00:00Z' },
        uptime: { type: 'number', example: 3600 },
      },
    },
  })
  async check() {
    let dbStatus = 'disconnected';
    
    try {
      await this.em.execute('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}