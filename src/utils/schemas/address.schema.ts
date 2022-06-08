import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Model } from 'mongoose'
import { Address as AddressType, Coordinates } from 'nesquik-types'
import { SchemaOptions } from './schemas-options'

export type AddressDocument = Address & Document
export type AddressModel = Model<AddressDocument>

@Schema(SchemaOptions)
export class Address implements AddressType {
  @Prop({ type: String })
  name: string

  @Prop({ type: String })
  coordinates: Coordinates

  @Prop({ type: String })
  phoneNumber: string

  @Prop({ type: String })
  personName: string

  @Prop({ type: String })
  description: string

  @Prop({ type: String })
  addressReference: string
}

export const AddressSchema = SchemaFactory.createForClass(Address)
