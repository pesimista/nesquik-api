import { Coordinates } from 'nesquik-types'
import { QuikProduct } from './product.model'

export interface Request {
  points: number
  requestID?: string
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | number
  from?: Coordinates
  fromDescription?: string
  estimatedTime?: number
  to?: Coordinates
  toDescription?: string
  phoneNumber?: string
  contactName?: string
  createdAt: any
  products: QuikProduct[]
  statusUpdateTimes: {
    [key: number]: unknown
  }
  providedBy?: {
    affiliateID: string
    userID: string
    name: string
    lastName: string
    nickname: string
    status?: string
  }
  deliveredBy?: {
    affiliateID?: string
    userID?: string
    name?: string
    status?: string
    phoneNumber?: string
    takenAt?: any
  }
  requestedBy: {
    userID: string
    name: string
    lastName: string
    nickname: string
    transactionsCompleted?: number
    phoneNumber?: string
  }
  jobID?: string
  requestDetails?: {
    from?: string
    to?: string
    description?: string
  }
  deliveryType?: number
  reviewed?: boolean
  isNotificationDisabled?: boolean
  wasNextFreeDelivery?: boolean
  requestSchedule: number
  transactionID?: string
  adjustments: {
    description: string
    points: number
    createdAt?: Date
    target?: string
    transactionID?: string
  }[]
  adjustment: {
    createdAt: unknown
    motive: string
    newdistanceTraveled: number
    newPrice: number
    previusDistance: number
    previusPrice: number
    previusTruePrice: number
    status: string
  }
  hasQuikLabel: boolean
  isCash?: boolean
  cashAmount?: number
  requestBatch?: string
  hasTrouble?: boolean
  isReducedDelivery?: boolean
  distanceToRequest?: number
}
