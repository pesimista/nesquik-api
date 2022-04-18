import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Banner as BannerType } from 'nesquik-types'

export type BannerDocument = Banner & Document & { priority: number }

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id
    },
  },
})
export class Banner implements Partial<BannerType> {
  @Prop({ type: String })
  bannerID: string

  @Prop({ type: String, required: true })
  image: string

  @Prop({ type: String })
  largeImage: string

  @Prop({ type: [String] })
  largeImagesArray: string[]

  @Prop({ type: String, default: 'other' })
  type: 'lead' | 'category' | 'promo' | 'service'

  @Prop({ type: String })
  name: string

  @Prop({ type: Number, default: 0 })
  order: number // priority

  @Prop({ type: Boolean })
  isHidden: boolean

  @Prop({ type: String })
  url: string

  @Prop({
    type: {
      storeid: { type: String },
      productID: { type: String },
    },
  })
  queryParams: { storeid: string; productID: string }

  @Prop({ type: Boolean })
  disabled: boolean

  @Prop({ type: String })
  caption: string

  @Prop({ type: Boolean })
  isDelivery: boolean

  @Prop({ type: Number })
  radiusDistance: number

  @Prop({ type: String })
  col: string

  @Prop({ type: String })
  backgroundColor: string

  @Prop({ type: String })
  exclusiveFor: 'mobile' | 'desktop' | 'both'
}

export const BannerSchema = SchemaFactory.createForClass(Banner)
