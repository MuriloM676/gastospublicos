import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CamaraModule } from './camara/camara.module';
import { ImportModule } from './import/import.module';

@Module({
  imports: [PrismaModule, CamaraModule, ImportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
