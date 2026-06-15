import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('States')
@Controller('api/v1/states')
export class StatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista de estados' })
  async getStates() {
    const states = await this.prisma.state.findMany({
      orderBy: { code: 'asc' },
    });
    return states.map((s) => ({ code: s.code, name: s.name }));
  }
}
