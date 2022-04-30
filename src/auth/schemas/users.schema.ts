/* eslint-disable @typescript-eslint/no-this-alias */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import mongoose, { Document, Model } from 'mongoose'
import { User as UserType } from 'nesquik-types'
import { SchemaOptions } from '../../utils/schemas/schemas-options'

export type UserDocument = User & Document
export type UserModel = Model<UserDocument> & {
  isEmailTaken: (email: string, excludeUserId?: string) => Promise<boolean>
}

const toJSON: mongoose.ToObjectOptions = {
  ...SchemaOptions.toJSON,
  transform: (doc, ret) => {
    delete ret._id
    delete ret.password
    delete ret.salt
  },
}

@Schema({
  ...SchemaOptions,
  toJSON,
})
export class User implements Partial<UserType> {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  lastName: string

  @Prop({ type: String })
  nickname: string

  @Prop({
    type: Number,
    default: 0,
  })
  points: number

  @Prop({ type: Number, default: 0 })
  pointsEarned: number

  @Prop({ type: Number, default: 0 })
  pointsSpent: number

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email: string

  @Prop({
    type: String,
    trim: true,
    minlength: 8,
    validate(value) {
      if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        throw new Error(
          'Password must contain at least one letter and one number'
        )
      }
    },
    private: true, // used by the toJSON plugin
  })
  password: string

  @Prop({
    type: Boolean,
    default: false,
  })
  isEmailVerified: boolean

  @Prop({
    type: Boolean,
    default: false,
  })
  isAnonymous: boolean

  @Prop({ type: String })
  salt: string

  @Prop({ type: Date, default: new Date() })
  lastAccess: Date

  isPasswordMatch: (pass: string) => Promise<boolean>
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre<UserDocument>('save', async function () {
  const user = this
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(8)
    user.salt = salt
    user.password = await bcrypt.hash(user.password, salt)
  }

  if (user.isModified('name') || user.isModified('lastName')) {
    user.nickname = `${user.name} ${user.lastName}`
  }
})

UserSchema.methods.isPasswordMatch = function (
  password: string
): Promise<boolean> {
  const user: UserDocument = this
  return bcrypt.compare(password, user.password)
}

// UserSchema.statics.isEmailTaken = async function (
//   email: string,
//   excludeUserId?: string
// ): Promise<boolean> {
//   const user = await this.findOne({
//     email,
//     _id: { $ne: excludeUserId },
//     isAnonymous: false,
//   })
//   return Boolean(user)
// }
