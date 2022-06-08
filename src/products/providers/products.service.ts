import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
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
import { PickProductDto } from '../dto/pickProduct.dto'

@Injectable()
export class ProductsService {
  context = {
    service: ProductsService.name,
  }

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
      ...this.context,
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

  async pickProduct(dto: PickProductDto): Promise<ProductDocument> {
    const context = {
      ...this.context,
      name: this.pickProduct.name,
      productID: dto.productID,
    }

    const product = await this.getSingle(dto.productID)

    for (const option of product.options) {
      const value = dto.options.find(
        (item) => item.id === option._id.toString()
      )

      if (!value && option.required) {
        this.logger.error('required option not selected on product, skipping', {
          ...context,
          optionID: option._id,
          label: option.label,
        })

        throw new HttpException(
          `Required option not selected: ${option.label} (${option._id})`,
          HttpStatus.BAD_REQUEST
        )
      }

      if (!value) {
        this.logger.warn('option not selected on product, skipping', {
          ...context,
          optionID: option._id,
          label: option.label,
        })
        continue
      }

      // validate constraints
      const quantity = value.selected.reduce(
        (sum, current) => sum + current.quantity,
        0
      )

      if (option.min < quantity || option.max > quantity) {
        this.logger.error('selected option quantity out of bounds', {
          ...context,
          optionID: option._id,
          label: option.label,
        })

        throw new HttpException(
          `selected option quantity out of bounds: ${option.label} (${option._id}). Required: ${option.min}-${option.max}`,
          HttpStatus.BAD_REQUEST
        )
      }

      option.selected = value.selected
    }

    product.total = this.calculatePrice(product)
    return product
  }

  calculatePrice(product: ProductDocument): number {
    let total = product.price

    for (const option of product.options) {
      if (!option.usesPrice) {
        continue
      }

      for (const selection of option.selected) {
        const elements = option.elements as ProductDocument[]

        const element = elements.find(
          (item) => item._id.toString() === selection.elementID
        )

        total += element.price * selection.quantity
      }
    }

    return parseFloat(total.toFixed(2))
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
      ...this.context,
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
      ...this.context,
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
