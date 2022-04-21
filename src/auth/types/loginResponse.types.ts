import { UserDocument } from '../schemas/users.schema'

export type TokenResponse = {
  accessToken: string
  user: UserDocument
}
