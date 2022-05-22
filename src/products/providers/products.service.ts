import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { Logger } from 'winston'
import { QuikProduct } from '../../utils/quik-types'
import { CategoryDocument } from '../../utils/schemas/categories.schema'
import { MarketDocument } from '../../utils/schemas/market.schema'
import {
  OptionModel,
  Product,
  ProductDocument,
  ProductModel,
  ProductOption,
  ProductOptionsDocument,
} from '../../utils/schemas/product.schema'
import { GetAllProductsDto } from '../dto/getProducts.dto'
import { ImportProductDto } from '../dto/importProduct.dto'

@Injectable()
export class ProductsService {
  constructor(
    @Inject('winston') private logger: Logger,
    @InjectModel(Product.name) private productModel: ProductModel,
    @InjectModel(ProductOption.name) private optionModel: OptionModel
  ) {}

  async getAllProducts({
    market,
    subproducts = false,
  }: GetAllProductsDto): Promise<ProductDocument[]> {
    const context = {
      name: this.getAllProducts.name,
      market,
      subproducts,
    }
    const obj: { [key: string]: any } = { isSubproduct: subproducts }

    if (market) {
      obj.market = market
    }

    const query = this.productModel.find(obj)
    this.logger.info('fetching all products', context)
    return query
  }

  async getSingle(productID: string): Promise<ProductDocument> {
    let doc
    if (productID.length === 24) {
      this.logger.info('searching market by doc.id', { productID })
      doc = await this.productModel
        .findById(productID)
        .populate('options.elements', 'name price isAvailable')
        .populate('categories', 'name')
        .populate('market', 'name')
    }

    if (!doc) {
      this.logger.info('searching market by doc.productID', { productID })
      doc = await this.productModel
        .findOne({ productID })
        .populate('options.elements', 'name price isAvailable')
        .populate('categories', 'name')
        .populate('market', 'name')
    }

    return doc
  }

  formatProduct(dto: ImportProductDto): Partial<Product> {
    const isSubproduct = !Boolean(dto.productID) || Boolean(dto.isSubproduct)
    let name = (dto.name || dto.label).toLocaleLowerCase()
    name = name[0].toUpperCase() + name.substring(1)
    const productID = dto.productID ?? Buffer.from(name).toString('hex')

    return {
      isSubproduct,
      name,
      productID,
      stock: 100,
      rating: dto.rating || 0,
      isExclusive: Boolean(dto.isExclusive),
      tags: dto.tags,
      description: dto.description,
      shortDescription: dto.shortDescription || dto.description,
      pictures: dto.pictures,
      isAvailable: true,
      priority: dto.priority,
      magnitude: +(dto.magnitude || 1),
      measure: dto.measure || 'U',
      price: dto.price,
      promoValue: dto.promoValue,
      isPromo: Boolean(dto.promo),
    }
  }

  async importProduct(
    dto: ImportProductDto,
    marketID?: MarketDocument,
    categories?: CategoryDocument[],
    options?: ProductOptionsDocument[]
  ): Promise<ProductDocument> {
    const context = {
      name: this.importProduct.name,
      productID: dto.productID,
      productName: dto.name || dto.label,
    }

    const product = this.formatProduct(dto)
    product.categories = categories
    product.market = marketID
    product.options = options

    this.logger.info('searching product by name as hex', context)
    const doc = await this.productModel.findOne({
      $or: [{ productID: product.productID }, { name: product.name }],
    })

    if (!doc) {
      this.logger.info('creating product doc', context)
      return this.productModel.create(product)
    }

    if (product.isSubproduct && !doc.isSubproduct) {
      this.logger.info('skinpping updating main product', context)
      return doc
    }

    this.logger.info('updating product doc', context)
    product.productID =
      doc.productID.length === 20 ? doc.productID : product.productID
    await doc.updateOne(product)
    return doc
  }

  async importSubproducts(
    dto,
    marketID?: MarketDocument
  ): Promise<ProductOptionsDocument> {
    const context = {
      name: this.importSubproducts.name,
      key: dto.key,
    }

    this.logger.info('adding sub products to products collection', context)
    const promises = dto.elements.map((item: QuikProduct) =>
      this.importProduct(item, marketID)
    )
    const elements: ProductDocument[] = await Promise.all(promises)

    return new this.optionModel({
      ...dto,
      iterable: Boolean(dto.iterable),
      type: dto.controlType,
      elements,
    })
  }

  async clear() {
    return this.productModel.deleteMany({})
  }
}
