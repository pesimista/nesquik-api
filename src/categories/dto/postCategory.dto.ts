import { Category } from 'nesquik-types'

export class PostCategoryDto implements Category {
  categoryID: string
  parent: string
  image: string
  name: string
  affiliateID: string
}
