import { CategoryDocument } from '../../utils/schemas/categories.schema'
import { MarketDocument } from '../../utils/schemas/market.schema'

export type SingleMarketResponse = MarketDocument & {
  marketCategories: CategoryDocument[]
}
