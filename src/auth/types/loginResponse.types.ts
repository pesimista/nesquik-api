import { UserDocument } from '../../utils/schemas/users.schema'

export type TokenResponse = {
  accessToken: string
  user: UserDocument
}
