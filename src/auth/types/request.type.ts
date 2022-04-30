import { Request } from 'express'
import { UserDocument } from '../../utils/schemas/users.schema'
import { JwtPayload } from './jwt.types'

export type RequestLocal = Request & { user?: UserDocument }
export type RequestJwt = Request & { user?: JwtPayload }
