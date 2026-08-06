import { Module } from '@nestjs/common';
import { CarteirasService } from './carteiras.service';
import { CarteirasController } from './carteiras.controller';

@Module({
  controllers: [CarteirasController],
  providers: [CarteirasService],
  exports: [CarteirasService],
})
export class CarteirasModule {}
