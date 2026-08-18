import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CotacoesModule } from '../cotacoes/cotacoes.module';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistAnalyticsReadModelService } from './read-models/wishlist-analytics-read-model.service';

@Module({
  imports: [PrismaModule, CotacoesModule],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistAnalyticsReadModelService],
  exports: [WishlistService, WishlistAnalyticsReadModelService],
})
export class WishlistModule {}
