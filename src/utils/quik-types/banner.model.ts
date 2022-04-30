import { Coordinates } from 'nesquik-types'

export interface QuikBanner {
  bannerID?: string
  isHidden?: boolean
  caption?: string
  url: string
  image: string
  queryParams: {
    market: string
    dialog: string
  }
}

export interface QuikHomeBanner {
  bannerID: string
  image: string
  largeImage?: string
  largeImagesArray?: string[]
  type: 'lead' | 'category' | 'promo' | 'service' | 'commerce'
  distanceTraveled: number
  name: string
  priority: number
  isHidden: boolean
  isPickUp: boolean
  isNew: number
  url: string
  queryParams?: {
    [key: string]: string
  }
  disabled?: boolean
  caption?: string
  isDelivery?: boolean
  coordinates?: Coordinates
  radiusDistance?: number
  affiliateID?: string
  col?: string
  dateIn?: string
  dateOut?: string
  schedule?: string[]
  gender?: 'male' | 'female'
  ageRange?: string[]
  backgroundColor?: string
  exclusiveFor: 'mobile' | 'desktop' | 'both'
  // gallery?: GalleryItem[];
}
