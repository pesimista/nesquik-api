import { Coordinates } from 'nesquik-types'
import { QuikProduct } from './product.model'

export interface QuikCart {
  cartID?: string
  createdAt: any
  jobID?: string
  points: any
  products: QuikProduct[]
  addressID?: string
  addressName?: string
  addressDescription?: string
  addressReference?: string
  coordinates?: Coordinates
  status?: string
  phoneNumber?: string
  // tips?: AffiliateTip[];
}
