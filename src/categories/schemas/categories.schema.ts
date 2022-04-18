import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Category as CategoryType } from 'nesquik-types'

export type CategoryDocument = Category & Document

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id
    },
  },
})
export class Category implements CategoryType {
  @Prop({ type: String })
  categoryID: string

  @Prop({ type: String })
  image: string

  @Prop({ type: String })
  name: string

  @Prop({ type: String })
  affiliateID: string

  @Prop({ type: Number, default: 0 })
  order: string

  @Prop({ type: String })
  shape: string

  @Prop({ type: String })
  banner: string

  @Prop({ type: String })
  parent: string
}

export const CategorySchema = SchemaFactory.createForClass(Category)
