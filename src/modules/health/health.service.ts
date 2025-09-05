import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class HealthService {
  constructor(private readonly em: EntityManager) {}

  async checkHealth() {
    let databaseStatus = 'disconnected';
    let databaseVersion = null;
    
    try {
      // Simple database ping with version check
      const result = await this.em.getConnection().execute('SELECT version() as version');
      databaseStatus = 'connected';
      databaseVersion = result[0]?.version?.substring(0, 50) || 'unknown'; // Truncate long version
    } catch (error) {
      console.error('Database health check failed:', error.message);
      databaseStatus = 'error';
    }

    return {
      status: 'ok',
    timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: databaseStatus,
        version: databaseVersion,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100, // MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100, // MB
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
