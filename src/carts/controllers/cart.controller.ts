import { Controller, Get, UseGuards, Req, Post, Body, Delete, Param } from "@nestjs/common"
import { RequestJwt } from "../../auth/types/request.type"
import { PickProductDto } from "../../products/dto/pickProduct.dto"
import { ProductsService } from "../../products/providers/products.service"
import { JwtAuthGuard } from "../../utils/guards/jwt-auth.guard"
import { CartDocument } from "../../utils/schemas/carts.schema"
import { CartService } from "../providers/cart.service"


@Controller('cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private productService: ProductsService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserCart(@Req() req: RequestJwt): Promise<CartDocument> {
    try {
      let cart = await this.cartService.getSingle(req.user.id)

      if (!cart) {
        cart = await this.cartService.createCart(req.user.id)
      }

      return cart
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }

  // @Post()
  // @UseGuards(JwtAuthGuard)
  // async createUserCart(@Req() req: RequestJwt): Promise<CartDocument> {
  //   try {
  //     let cart = await this.cartService.getSingle(req.user.id)
  //     if (!cart) {
  //       cart = await this.cartService.createCart(req.user.id)
  //     }

  //     return cart
  //   } catch (error) {
  //     // space to add error login to sentry or any other logger service
  //     throw error
  //   }
  // }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  async addProduct(
    @Req() req: RequestJwt,
    @Body() dto: PickProductDto
  ): Promise<CartDocument> {
    try {
      const product = await this.productService.pickProduct(dto)

      product.depopulate('market')
      const cart = await this.cartService.addProduct(
        req.user.id,
        product,
        dto.quantity
      )

      return cart
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard)
  async removeProduct(
    @Req() req: RequestJwt,
    @Param('id') id: string
  ): Promise<CartDocument> {
    try {
      const product = await this.productService.getSingle(id)

      product.depopulate('market')
      const cart = await this.cartService.removeProduct(req.user.id, product)

      return cart
    } catch (error) {
      // space to add error login to sentry or any other logger service
      throw error
    }
  }
}
