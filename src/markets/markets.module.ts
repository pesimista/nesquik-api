import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  Category,
  CategorySchema,
} from '../categories/schemas/categories.schema'
import { Banner, BannerSchema } from '../utils/schemas/banners.schema'
import { MarketsController } from './controllers/markets.controller'
import { MarketsService } from './providers/markets.service'
import { Market, MarketSchema } from './schemas/market.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Market.name, schema: MarketSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Banner.name, schema: BannerSchema },
    ]),
  ],
  controllers: [MarketsController],
  providers: [MarketsService],
})
export class MarketsModule {}
