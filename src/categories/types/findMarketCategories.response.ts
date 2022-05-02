import { CategoryDocument } from '../../utils/schemas/categories.schema'

export type FindMarketCategoriesResponse = {
  categories: CategoryDocument[]
  marketCategories: CategoryDocument[]
}
