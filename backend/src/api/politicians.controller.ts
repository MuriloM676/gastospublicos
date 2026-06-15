import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Politicians')
@Controller('api/v1/politicians')
export class PoliticiansController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Perfil do político' })
  @ApiParam({ name: 'id', type: Number })
  async getPolitician(@Param('id') id: string) {
    const politician = await this.prisma.politician.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        state: true,
        party: true,
        expenses: true,
        mandates: { orderBy: { startDate: 'desc' } },
      },
    });

    if (!politician) throw new NotFoundException('Político não encontrado');

    const totalExpenses = politician.expenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );

    const firstExpense = politician.expenses
      .map((e) => e.expenseDate)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    const monthsActive = firstExpense
      ? Math.max(
          1,
          Math.ceil(
            (Date.now() - firstExpense.getTime()) / (1000 * 60 * 60 * 24 * 30),
          ),
        )
      : 1;

    const monthlyAverage = totalExpenses / monthsActive;

    // Rankings
    const allPoliticians = await this.prisma.politician.findMany({
      include: { expenses: true, state: true, party: true },
    });

    const ranked = allPoliticians
      .map((p) => ({
        id: p.id,
        total: p.expenses.reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);

    const nationalRanking =
      ranked.findIndex((r) => r.id === politician.id) + 1;

    const stateRanked = allPoliticians
      .filter((p) => p.stateId === politician.stateId)
      .map((p) => ({
        id: p.id,
        total: p.expenses.reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);

    const stateRanking =
      stateRanked.findIndex((r) => r.id === politician.id) + 1;

    const partyRanked = allPoliticians
      .filter((p) => p.partyId === politician.partyId)
      .map((p) => ({
        id: p.id,
        total: p.expenses.reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);

    const partyRanking =
      partyRanked.findIndex((r) => r.id === politician.id) + 1;

    return {
      id: politician.id,
      name: politician.name,
      photoUrl: politician.photoUrl,
      party: politician.party.acronym,
      state: politician.state.code,
      position: politician.currentRole,
      firstElectionDate: politician.firstElectionDate?.toISOString() ?? null,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      monthlyAverage: Math.round(monthlyAverage * 100) / 100,
      nationalRanking,
      stateRanking,
      partyRanking,
    };
  }

  @Get(':id/expenses')
  @ApiOperation({ summary: 'Gastos do político' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getExpenses(
    @Param('id') id: string,
    @Query('year') year?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page || '1', 10);
    const l = Math.min(parseInt(limit || '20', 10), 100);

    const where: any = {
      politicianId: parseInt(id, 10),
    };

    if (year) {
      where.expenseDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }

    if (category) {
      const cat = await this.prisma.expenseCategory.findUnique({
        where: { name: category },
      });
      if (cat) where.categoryId = cat.id;
    }

    const total = await this.prisma.expense.count({ where });
    const expenses = await this.prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { expenseDate: 'desc' },
      skip: (p - 1) * l,
      take: l,
    });

    return {
      items: expenses.map((e) => ({
        date: e.expenseDate.toISOString().split('T')[0],
        category: e.category.name,
        supplier: e.supplier,
        description: e.description,
        amount: e.amount,
        documentUrl: e.documentUrl,
      })),
      page: p,
      limit: l,
      total,
    };
  }

  @Get(':id/evolution')
  @ApiOperation({ summary: 'Evolução dos gastos' })
  @ApiParam({ name: 'id', type: Number })
  async getEvolution(@Param('id') id: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { politicianId: parseInt(id, 10) },
      select: { amount: true, expenseDate: true },
    });

    const monthly: Record<string, number> = {};
    const yearly: Record<string, number> = {};

    for (const e of expenses) {
      const date = new Date(e.expenseDate);
      const yearKey = date.getFullYear().toString();
      const monthKey = `${yearKey}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      yearly[yearKey] = (yearly[yearKey] || 0) + e.amount;
      monthly[monthKey] = (monthly[monthKey] || 0) + e.amount;
    }

    return {
      monthly: Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, total]) => ({ period, total: Math.round(total * 100) / 100 })),
      yearly: Object.entries(yearly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, total]) => ({ period, total: Math.round(total * 100) / 100 })),
    };
  }
}
