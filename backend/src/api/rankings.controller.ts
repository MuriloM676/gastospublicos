import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Rankings')
@Controller('api/v1/rankings')
export class RankingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('national')
  @ApiOperation({ summary: 'Ranking nacional de gastos' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'party', required: false })
  @ApiQuery({ name: 'position', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getNationalRanking(
    @Query('year') year?: string,
    @Query('state') state?: string,
    @Query('party') party?: string,
    @Query('position') position?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page || '1', 10);
    const l = Math.min(parseInt(limit || '20', 10), 100);

    const where: any = {};
    if (state) {
      const s = await this.prisma.state.findUnique({ where: { code: state } });
      if (s) where.stateId = s.id;
    }
    if (party) {
      const pa = await this.prisma.party.findUnique({ where: { acronym: party } });
      if (pa) where.partyId = pa.id;
    }
    if (year) {
      where.expenses = {
        some: {
          expenseDate: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
          },
        },
      };
    }

    const politicians = await this.prisma.politician.findMany({
      where,
      include: {
        state: true,
        party: true,
        expenses: year
          ? {
              where: {
                expenseDate: {
                  gte: new Date(`${year}-01-01`),
                  lte: new Date(`${year}-12-31`),
                },
              },
            }
          : true,
      },
    });

    const total = politicians.length;

    const ranked = politicians
      .map((pol) => ({
        id: pol.id,
        name: pol.name,
        party: pol.party.acronym,
        state: pol.state.code,
        position: pol.currentRole,
        totalExpenses: pol.expenses.reduce((sum, e) => sum + e.amount, 0),
      }))
      .sort((a, b) => b.totalExpenses - a.totalExpenses || a.name.localeCompare(b.name))
      .map((item, index) => ({ ...item, ranking: index + 1 }));

    const start = (p - 1) * l;
    const items = ranked.slice(start, start + l);

    return {
      items,
      page: p,
      limit: l,
      total,
    };
  }

  @Get('top')
  @ApiOperation({ summary: 'Top 3 maiores gastadores' })
  async getTop3() {
    const politicians = await this.prisma.politician.findMany({
      include: { state: true, party: true, expenses: true },
    });

    const ranked = politicians
      .map((pol) => ({
        id: pol.id,
        name: pol.name,
        party: pol.party.acronym,
        state: pol.state.code,
        position: pol.currentRole,
        totalExpenses: pol.expenses.reduce((sum, e) => sum + e.amount, 0),
      }))
      .sort((a, b) => b.totalExpenses - a.totalExpenses || a.name.localeCompare(b.name));

    return {
      first: ranked[0] || null,
      second: ranked[1] || null,
      third: ranked[2] || null,
    };
  }
}
