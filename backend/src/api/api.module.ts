import { Module } from '@nestjs/common';
import { RankingsController } from './rankings.controller';
import { PoliticiansController } from './politicians.controller';
import { SearchController } from './search.controller';
import { StatesController } from './states.controller';
import { DashboardController } from './dashboard.controller';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    RankingsController,
    PoliticiansController,
    SearchController,
    StatesController,
    DashboardController,
    HealthController,
  ],
})
export class ApiModule {}
