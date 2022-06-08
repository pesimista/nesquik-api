import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Address } from './address.schema'
import { MarketDocument } from './market.schema'
import { Product, ProductDocument } from './product.schema'
import { SchemaOptions } from './schemas-options'
import { User } from './users.schema'

export type CartDocument = Cart & Document
export type CartOrderDocument = CartOrder & Document

export type CartOrderModel = mongoose.Model<CartOrderDocument>
export type CartModel = mongoose.Model<CartDocument>

@Schema(SchemaOptions)
export class CartOrder {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Market' })
  market: string | MarketDocument

  @Prop({ type: Number })
  subtotal: number

  @Prop({ type: Number })
  delivery: number

  @Prop({ type: Number })
  total: number

  @Prop([{ type: Product }])
  products: ProductDocument[]
}

@Schema(SchemaOptions)
export class Cart {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  user: string | User

  @Prop({ type: Address })
  address: Address

  @Prop({ type: Number, default: 0 })
  total: number

  @Prop([{ type: CartOrder, default: [] }])
  orders: CartOrder[]
}

export const CartOrderSchema = SchemaFactory.createForClass(CartOrder)
export const CartSchema = SchemaFactory.createForClass(Cart)
