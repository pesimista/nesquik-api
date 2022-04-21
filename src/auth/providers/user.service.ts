import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { RegisterUserDto } from '../dto/register.dto'
import { User, UserDocument, UserModel } from '../schemas/users.schema'

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private model: UserModel) {}

  async findByEmail(email: string): Promise<UserDocument> {
    return this.model.findOne({ email })
  }

  async register(user: RegisterUserDto): Promise<UserDocument> {
    const isTaken = await this.model.isEmailTaken(user.email)

    if (isTaken) {
      throw new HttpException('Email already taken', HttpStatus.CONFLICT)
    }

    const doc = await this.model.create(user)

    return doc
  }
}
