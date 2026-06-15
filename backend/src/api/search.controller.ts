import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Search')
@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Busca de políticos' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') q: string) {
    if (!q || q.length < 2) {
      return { items: [] };
    }

    const politicians = await this.prisma.politician.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { party: { acronym: { contains: q, mode: 'insensitive' } } },
          { state: { code: { contains: q, mode: 'insensitive' } } },
          { currentRole: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { state: true, party: true },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return {
      items: politicians.map((p) => ({
        id: p.id,
        name: p.name,
        party: p.party.acronym,
        state: p.state.code,
      })),
    };
  }
}
