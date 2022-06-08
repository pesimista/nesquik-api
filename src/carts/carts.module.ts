import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProductsService } from '../products/providers/products.service'
import {
  Cart,
  CartOrder,
  CartOrderSchema,
  CartSchema,
} from '../utils/schemas/carts.schema'
import {
  Product,
  ProductOption,
  ProductOptionSchema,
  ProductSchema,
} from '../utils/schemas/product.schema'
import { CartController } from './controllers/cart/cart.controller'
import { CartService } from './providers/cart/cart.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductOption.name, schema: ProductOptionSchema },
      { name: Cart.name, schema: CartSchema },
      { name: CartOrder.name, schema: CartOrderSchema, collection: '' },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService, ProductsService],
})
export class CartsModule {}
