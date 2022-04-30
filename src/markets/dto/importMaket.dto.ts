import { Coordinates } from 'nesquik-types'
import {
  QuikBanner,
  QuikCategory,
  QuikMarket,
  QuikSchedule,
} from '../../utils/quik-types'

export class ImportMarketDto implements QuikMarket {
  images: {
    profile: string
    header: string
    showcaseBackgroundImage: string
    backgroundImage: string
    marketing: string[]
    headerBackgroundColor: string
  }
  marketID: string
  name: string
  affiliate: { affiliateID: string; name: string; rif: string }
  logo: string
  deliveryServiceType: 'own' | 'quik' | 'mix'
  estimatedTime?: number
  radiusDistance?: number
  pointsToFreeDelivery?: number
  phoneNumber: string
  isDeliveryOnly?: boolean
  rif: string
  maxDeliveryRange?: number
  isHidden?: boolean
  tags?: string[]
  addressID: string
  address: string
  addressName: string
  bikeDistance: number
  cashBackPercentage: number
  percentageCommission?: number
  scanCommission?: number
  paysFee: boolean
  isPremium: boolean
  coordinates: Coordinates
  schedule: QuikSchedule[]
  categories: { ids: string[]; categoriesDescriptions: QuikCategory[] }
  marketCategories: {
    categoriesIds: string[]
    categoriesDescriptions: QuikCategory[]
  }

  marketing: QuikBanner[]
  products: string[]
  rating: number
  contact: {
    phoneNumber: string
    whatsapp: string
    instagram: string
    twitter: string
  }
  status?: 'active' | 'inactive' | 'taking orders' | 'using schedule'
  isOnlyQuik?: boolean
  hasFreeDelivery?: boolean
  hasCompletedProfile?: boolean
  hasPromo?: number
  outOfStock: number
  affiliateCategory: string
  layout?: 'list' | 'categories' | 'mall'
  ownershipStatus: 'affiliated' | 'added'
  isSocialMediaLinked?: boolean
  ranking?: number
  productBackground: string
  productsWithLongDelivery?: number
  isDeliveryAffiliate?: boolean
  distanceTraveled?: number
}
