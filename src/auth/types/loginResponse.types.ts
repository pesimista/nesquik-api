import { UserDocument } from '../schemas/users.schema'

export type LoginResponse = {
  accessToken: string
  user: UserDocument
}
