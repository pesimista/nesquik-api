import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { Document } from 'mongoose'
import { Category as CategoryType } from 'nesquik-types'
import { Market } from './market.schema'
import { SchemaOptions } from './schemas-options'

export type CategoryDocument = Category & Document

@Schema(SchemaOptions)
export class Category implements Partial<CategoryType> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Market' })
  market: string | Market

  @Prop({ type: String })
  categoryID: string

  @Prop({ type: String })
  image: string

  @Prop({ type: String })
  name: string

  @Prop({ type: Number, default: 0 })
  order: number

  @Prop({ type: String })
  shape: string

  @Prop({ type: String })
  banner: string

  @Prop({ type: String })
  parent: string
}

export const CategorySchema = SchemaFactory.createForClass(Category)
