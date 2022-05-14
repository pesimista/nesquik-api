import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CategoriesService } from '../categories/providers/categories.service'
import { MarketsService } from '../markets/providers/markets.service'
import { Banner, BannerSchema } from '../utils/schemas/banners.schema'
import { Category, CategorySchema } from '../utils/schemas/categories.schema'
import { Market, MarketSchema } from '../utils/schemas/market.schema'
import {
  Product,
  ProductOption,
  ProductOptionSchema,
  ProductSchema,
} from '../utils/schemas/product.schema'
import { ProductsController } from './controllers/products.controller'
import { ProductsService } from './providers/products.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductOption.name, schema: ProductOptionSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Market.name, schema: MarketSchema },
      { name: Banner.name, schema: BannerSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CategoriesService, MarketsService],
})
export class ProductsModule {}
