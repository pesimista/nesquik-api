import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { RegisterUserDto } from '../dto/register.dto'
import { User, UserDocument, UserModel } from '../schemas/users.schema'
import * as crypto from 'crypto'

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private model: UserModel) {}

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.model.findOne({ email })

    if (user) {
      user.lastAccess = new Date()
      await user.save()
    }

    return user
  }

  async register(
    user: RegisterUserDto,
    anonymousID: string
  ): Promise<UserDocument> {
    try {
      const doc = await this.model.findById(anonymousID)

      if (!doc.isAnonymous) {
        throw new HttpException(
          'This user is not anonymous',
          HttpStatus.UNAUTHORIZED
        )
      }

      doc.name = user.name
      doc.email = user.email
      doc.password = user.password
      doc.isAnonymous = false
      doc.lastAccess = new Date()
      await doc.save()

      console.log(doc)
      return doc
    } catch (error) {
      // email not unique
      if (error.code === 11000) {
        throw new HttpException('Email already taken', HttpStatus.CONFLICT)
      }

      throw error
    }
  }

  async createAnonymus(): Promise<UserDocument> {
    try {
      const email = crypto.randomBytes(8).toString('hex')

      const user = await this.model.create({
        name: 'Anonymus',
        isAnonymous: true,
        email: `${email}@nesquik.com`,
      })

      return user
    } catch (error) {
      // email not unique
      if (error.code === 11000) {
        throw new HttpException('Email already taken', HttpStatus.CONFLICT)
      }

      throw error
    }
  }

  async deleteAnonymous(anonymousID: string): Promise<void> {
    const doc = await this.model.findById(anonymousID)

    if (!doc.isAnonymous) {
      return
    }

    return doc.delete()
  }
}
