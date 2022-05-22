import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { CategoriesService } from '../../categories/providers/categories.service'
import { MarketsService } from '../../markets/providers/markets.service'
import { CategoryDocument } from '../../utils/schemas/categories.schema'
import { ProductDocument } from '../../utils/schemas/product.schema'
import { GetAllProductsDto } from '../dto/getProducts.dto'
import { ProductsService } from '../providers/products.service'

@Controller('products')
export class ProductsController {
  constructor(
    private marketService: MarketsService,
    private categoriesService: CategoriesService,
    private service: ProductsService
  ) {}

  @Get()
  async findAll(@Query() query: GetAllProductsDto) {
    const items = await this.service.getAllProducts(query)

    return {
      count: items.length,
      items,
    }
  }

  @Get(':id')
  async findProduct(@Param('id') productID) {
    const doc = await this.service.getSingle(productID)

    if (!doc) {
      throw new NotFoundException('Product not found')
    }

    return doc
  }

  @Post('import')
  async importProduct(@Body() dto): Promise<ProductDocument> {
    const market = await this.marketService.getSingle(dto.mainMarket)

    if (!market) {
      throw new BadRequestException('Market not found for this product')
    }

    const categoriesP = dto.marketCategories.ids.map((id) =>
      this.categoriesService.getSingle(id)
    )
    const categories: CategoryDocument[] = await Promise.all(categoriesP)

    // can't make it promise all due to concurency
    const options = []
    const iterable = dto.options || []
    for (const item of iterable) {
      const res = await this.service.importSubproducts(item, market)
      options.push(res)
    }

    const product = await this.service.importProduct(
      dto,
      market,
      categories.filter(Boolean),
      options
    )

    return product
  }
}
