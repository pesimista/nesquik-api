import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CategoriesController } from './controllers/categories.controller'
import { CategoriesService } from './providers/categories.service'
import { Category, CategorySchema } from '../utils/schemas/categories.schema'
import { MarketsService } from '../markets/providers/markets.service'
import { Market, MarketSchema } from '../utils/schemas/market.schema'
import { Banner, BannerSchema } from '../utils/schemas/banners.schema'
import { AppConfigModule } from '../config/config.module'

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Market.name, schema: MarketSchema },
      { name: Banner.name, schema: BannerSchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, MarketsService],
})
export class CategoriesModule {}
