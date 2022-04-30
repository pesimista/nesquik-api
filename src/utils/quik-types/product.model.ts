import { QuikCategory } from './category.model'
import { QuikSchedule } from './schedule.model'

export interface QuikProduct {
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
  categories: {
    ids: string[]
    categoriesDescriptions: QuikCategory[]
  }
  category?: QuikCategory[]
  marketCategories: {
    ids: string[]
    categoriesDescriptions: QuikCategory[]
  }
  // options: ProductOptionBase<any>[];
  optionsValue: {
    units: any
    [key: string]: { value: string; multiplier: number }[]
  }
  prettifiedOptions: { label: string; value: string | string[] }[]
  measure?: string
  magnitude?: string
  shelf?: string
  shelfLevel?: string
  inStock?: boolean
  isSubproduct: boolean
  isOnlyDelivery?: boolean
  priority?: number
  constraints: {
    max: number
  }
  buyPrice?: number
  minStock?: number
  // warning?: ValidatedProductWarning;
  fromQuikMarket?: boolean
  cartIndex?: number
  schedule?: QuikSchedule[]
  isDisabled?: boolean
}
