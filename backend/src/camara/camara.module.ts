import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CamaraService } from './camara.service';

@Module({
  imports: [HttpModule],
  providers: [CamaraService],
  exports: [CamaraService],
})
export class CamaraModule {}
