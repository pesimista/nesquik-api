import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Logger } from 'winston'
import {
  Cart,
  CartDocument,
  CartModel,
  CartOrder,
  CartOrderModel,
} from '../../../utils/schemas/carts.schema'
import { ProductDocument } from '../../../utils/schemas/product.schema'

@Injectable()
export class CartService {
  constructor(
    @Inject('winston') private logger: Logger,
    @InjectModel(Cart.name) private cartModel: CartModel,
    @InjectModel(CartOrder.name) private orderModel: CartOrderModel
  ) {}

  async getSingle(userID: string): Promise<CartDocument> {
    const context = {
      name: this.getSingle.name,
      userID,
    }

    this.logger.info('searching cart by userID', context)
    return this.cartModel.findOne({ userID })
  }

  async createCart(userID: string): Promise<CartDocument> {
    const context = {
      name: this.getSingle.name,
      userID,
    }

    this.logger.info('creating cart for user', context)
    return this.cartModel.create({
      user: userID,
      address: null,
      total: 0,
      orders: [],
    })
  }

  calculateOrderPrice(order: CartOrder): number {
    let total = 0

    for (const product of order.products) {
      total += product.total
    }

    return parseFloat(total.toFixed(2))
  }

  calculateCartTotal(cart: CartDocument): number {
    let total = 0

    for (const order of cart.orders) {
      total += order.total
    }

    return parseFloat(total.toFixed(2))
  }

  async addProduct(
    userID: string,
    product: ProductDocument,
    quantity: number
  ): Promise<CartDocument> {
    const context = {
      name: this.addProduct.name,
      userID,
      marketID: product.market,
      productID: product.productID,
    }

    const cart = await this.getSingle(userID)

    if (!cart) {
      throw new HttpException('user doesnt have cart', HttpStatus.NOT_FOUND)
    }

    product.total = quantity * product.total
    product.quantity = quantity

    this.logger.info('searching for the market order on cart', context)

    let order = cart.orders.find(
      (item) => item.market.toString() === product.market.toString()
    )

    if (!order) {
      this.logger.info('order doesnt exist, creating', context)

      order = new this.orderModel({
        market: product.market,
        subtotal: 0,
        delivery: 0,
        total: 0,
        products: [],
      })

      const i = cart.orders.push(order)
      order = cart.orders[i - 1]
    }

    const index = order.products.findIndex(
      (item) => item._id.toString() === product._id.toString()
    )

    if (index === -1) {
      this.logger.info('product doesnt exist in order, creating', context)
      order.products.push(product)
    } else {
      this.logger.info('product exist in order, updating', context)
      order.products[index] = product
    }

    const subtotal = this.calculateOrderPrice(order)
    order.subtotal = subtotal

    // do some delivery shenanigans

    order.total = subtotal

    cart.total = this.calculateCartTotal(cart)
    await cart.save()

    return cart
  }

  async removeProduct(
    userID: string,
    product: ProductDocument
  ): Promise<CartDocument> {
    const context = {
      name: this.addProduct.name,
      userID,
      marketID: product.market,
      productID: product.productID,
    }

    const cart = await this.getSingle(userID)

    if (!cart) {
      throw new HttpException('user doesnt have cart', HttpStatus.NOT_FOUND)
    }

    this.logger.info('searching for the market order on cart', context)
    const orderIndex = cart.orders.findIndex(
      (item) => item.market.toString() === product.market.toString()
    )

    if (orderIndex === -1) {
      this.logger.info('order doesnt exist', context)
      return cart
    }

    const order = cart.orders[orderIndex]
    const index = order.products.findIndex(
      (item) => item._id.toString() === product._id.toString()
    )

    if (index === -1) {
      this.logger.info('order doesnt contain product', context)
      return cart
    }

    // remove unique product and delete order
    if (order.products.length === 1) {
      this.logger.debug('order shall be removed too', context)
      cart.orders.splice(orderIndex, 1)
    } else {
      this.logger.debug('removing product', context)
      order.products.splice(index, 1)
      const subtotal = this.calculateOrderPrice(order)
      order.subtotal = subtotal
      order.total = subtotal
    }

    // do some delivery shenanigans
    cart.total = this.calculateCartTotal(cart)
    await cart.save()

    return cart
  }
}
