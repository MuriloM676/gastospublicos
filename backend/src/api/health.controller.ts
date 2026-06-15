import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Healthcheck do sistema' })
  async check() {
    let database: string;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'healthy' : 'degraded',
      database,
      api: 'up',
    };
  }
}
