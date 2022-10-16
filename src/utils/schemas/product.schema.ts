import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import {
  OptionValues,
  Product as ProductType,
  ProductOption as ProductOptionType,
} from 'nesquik-types'
import { Category } from './categories.schema'
import { MarketDocument } from './market.schema'
import { SchemaOptions } from './schemas-options'

export type ProductDocument = Product & Document
export type ProductOptionsDocument = ProductOption & Document

export type OptionModel = mongoose.Model<ProductOptionsDocument>
export type ProductModel = mongoose.Model<ProductDocument>

@Schema(SchemaOptions)
export class ProductOption implements Omit<ProductOptionType, 'elements'> {
  @Prop({ type: String })
  type: string

  @Prop({ type: String })
  label: string

  @Prop({ type: Boolean })
  iterable: boolean

  @Prop({ type: Number, default: 1 })
  min: number

  @Prop({ type: Number, default: 1 })
  max: number

  @Prop({ type: Boolean })
  usesPrice: boolean

  @Prop({ type: Boolean })
  required: boolean

  // @Props()
  // constraints

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }])
  elements: ProductDocument[] | string[]

  @Prop([
    {
      _id: false,
      type: {
        elementID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 0 },
      },
    },
  ])
  selected: OptionValues[]
}

@Schema(SchemaOptions)
export class Product implements Omit<ProductType, 'options'> {
  @Prop({ type: Boolean, default: false })
  isSubproduct: boolean

  @Prop({ type: Number, min: 0 })
  stock: number

  @Prop({ type: Number, min: 0, default: 3 })
  rating: number

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Market' })
  market: string | MarketDocument

  @Prop({ type: Boolean, default: false })
  isExclusive: boolean

  @Prop({ type: [String] })
  tags?: string[]

  @Prop({ type: String })
  description: string

  @Prop({ type: String })
  shortDescription: string

  @Prop({ type: String })
  pictures: string

  @Prop({ type: Boolean, default: true })
  isAvailable: boolean

  @Prop({ type: Number, default: 0 })
  priority: number

  @Prop({ type: Number, default: 1 })
  magnitude: number

  @Prop({ type: String, default: 'U' })
  measure: string

  @Prop({ type: String, required: true })
  name: string

  @Prop({ type: String })
  productID: string

  @Prop({ type: Number, min: 0 })
  price: number

  @Prop({ type: Number, default: 0 })
  promoValue: number

  @Prop({ type: Number, default: 0 })
  quantity: number

  @Prop({ type: Number, default: 0 })
  total: number

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Category' })
  categories: Category[] | string[]

  @Prop({ type: Boolean, default: false })
  isPromo: boolean

  @Prop([{ type: ProductOption }])
  options: Partial<ProductOptionsDocument>[]
}

export const ProductOptionSchema = SchemaFactory.createForClass(ProductOption)
export const ProductSchema = SchemaFactory.createForClass(Product)
