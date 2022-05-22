import { QuikCategory, QuikProduct, QuikSchedule } from '../../utils/quik-types'

export class ImportProductDto implements Partial<QuikProduct> {
  category?: Partial<QuikCategory>[]
  marketCategories: {
    ids: string[]
    categoriesDescriptions: Partial<QuikCategory>[]
  }
  productID: string
  barcode: string
  createdAt: any
  name: string
  description: string
  shortDescription?: string
  productCategory: string
  rating: number
  pictures: string
  affiliate: {
    affiliateID: string
    name: string
    image?: string
  }
  label?: string
  mainMarket: string
  marketID: string[]
  price: number
  stock: number
  isAvailable: boolean
  isExclusive: boolean
  hasFreeDelivery: boolean
  promo: number
  promoValue?: number
  tags: string[]
  deliveryType?: number
  isOrder: boolean
  hasLongDistanceDelivery: boolean
  units?: number
  unitsSold: number
  measure?: string
  magnitude?: string
  shelf?: string
  shelfLevel?: string
  inStock?: boolean
  isSubproduct: boolean
  isOnlyDelivery?: boolean
  priority?: number
  constraints: { max: number }
  buyPrice?: number
  minStock?: number
  fromQuikMarket?: boolean
  cartIndex?: number
  schedule?: QuikSchedule[]
  isDisabled?: boolean
}
