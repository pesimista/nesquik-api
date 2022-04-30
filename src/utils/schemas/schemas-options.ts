import mongoose from 'mongoose'

export const SchemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id
    },
  },
}
