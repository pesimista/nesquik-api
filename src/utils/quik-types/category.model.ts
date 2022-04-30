export interface QuikCategory {
  affiliateID: string
  marketID?: string
  marketCategoryID?: string
  categoryID?: string
  image: string
  name: string
  parent: string
  shape?: 'square' | 'rectangle'
  banner?: string
  schedule?: string[]
  order?: number
  isHidden?: boolean
}
