import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Visão geral do dashboard' })
  async getOverview() {
    const totalPoliticians = await this.prisma.politician.count();
    const expenses = await this.prisma.expense.findMany({
      include: { politician: { include: { party: true } } },
    });

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    const byPolitician: Record<number, { id: number; name: string; total: number }> = {};
    for (const e of expenses) {
      if (!byPolitician[e.politicianId]) {
        byPolitician[e.politicianId] = { id: e.politicianId, name: e.politician.name, total: 0 };
      }
      byPolitician[e.politicianId].total += e.amount;
    }
    const ranked = Object.values(byPolitician).sort((a, b) => b.total - a.total);
    const topSpender = ranked[0] || null;

    const byParty: Record<number, { acronym: string; total: number }> = {};
    for (const e of expenses) {
      const pid = e.politician.partyId;
      if (!byParty[pid]) {
        byParty[pid] = { acronym: e.politician.party.acronym, total: 0 };
      }
      byParty[pid].total += e.amount;
    }
    const partyRanked = Object.values(byParty).sort((a, b) => b.total - a.total);
    const topParty = partyRanked[0] || null;

    return {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalPoliticians,
      topSpender: topSpender ? { id: topSpender.id, name: topSpender.name, total: Math.round(topSpender.total * 100) / 100 } : null,
      topParty: topParty ? { acronym: topParty.acronym, total: Math.round(topParty.total * 100) / 100 } : null,
    };
  }

  @Get('states')
  @ApiOperation({ summary: 'Gastos por estado' })
  async getStatesExpenses() {
    const politicians = await this.prisma.politician.findMany({
      include: { state: true, expenses: true },
    });

    const byState: Record<string, number> = {};
    for (const p of politicians) {
      const total = p.expenses.reduce((s, e) => s + e.amount, 0);
      byState[p.state.code] = (byState[p.state.code] || 0) + total;
    }

    return Object.entries(byState)
      .map(([state, totalExpenses]) => ({
        state,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
      }))
      .sort((a, b) => b.totalExpenses - a.totalExpenses);
  }

  @Get('parties')
  @ApiOperation({ summary: 'Gastos por partido' })
  async getPartiesExpenses() {
    const politicians = await this.prisma.politician.findMany({
      include: { party: true, expenses: true },
    });

    const byParty: Record<string, number> = {};
    for (const p of politicians) {
      const total = p.expenses.reduce((s, e) => s + e.amount, 0);
      byParty[p.party.acronym] = (byParty[p.party.acronym] || 0) + total;
    }

    return Object.entries(byParty)
      .map(([party, totalExpenses]) => ({
        party,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
      }))
      .sort((a, b) => b.totalExpenses - a.totalExpenses);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Gastos por categoria' })
  async getCategoriesExpenses() {
    const categories = await this.prisma.expenseCategory.findMany({
      include: { expenses: true },
    });

    return categories
      .map((c) => ({
        category: c.name,
        totalExpenses: Math.round(c.expenses.reduce((s, e) => s + e.amount, 0) * 100) / 100,
      }))
      .sort((a, b) => b.totalExpenses - a.totalExpenses);
  }
}
