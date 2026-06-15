import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CamaraModule } from '../camara/camara.module';

@Module({
  imports: [PrismaModule, CamaraModule],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
