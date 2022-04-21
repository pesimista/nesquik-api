import { Module } from '@nestjs/common'
import { ProductsController } from './controllers/products.controller'
import { ProductsService } from './providers/products.service'

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
