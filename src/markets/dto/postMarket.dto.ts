import {
  Banner,
  Category,
  Coordinates,
  Market,
  MarketImages,
  Schedule,
} from 'nesquik-types'

export class PostMarketDto implements Market {
  address: string
  addressID: string
  addressName: string
  bikeDistance: number
  coordinates: Coordinates
  email: string
  estimatedTime: number
  hasFreeDelivery: boolean
  hasPromo: boolean
  images: MarketImages
  isDeliveryOnly: boolean
  isOnlyQuik: boolean
  isPremium: boolean
  logo: string
  marketID: string
  marketing: Banner[]
  marketRanking: number
  maxDeliveryRange: number
  name: string
  radiusDistance: number
  ranking: number
  rating: number
  schedule: Schedule[]
  status: string
  categories: Category[]
}
