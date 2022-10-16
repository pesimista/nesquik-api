import { ImportProductDto } from '../../src/products/dto/importProduct.dto'
import { Product as BaseProduct } from '../../src/utils/schemas/product.schema'

type QuikProduct = ImportProductDto & {
  [key: string]: any
}

type Product = BaseProduct & {
  id: string
  [key: string]: any
}

export const QuikProducMock: QuikProduct = {
  isOrder: false,
  minStock: null,
  marketCategories: {
    categoriesDescriptions: [
      {
        name: 'Burgers',
        image:
          'https://firebasestorage.googleapis.com/v0/b/quik-test-d955c.appspot.com/o/test%2F1590339716432_Burger.svg?alt=media&token=908dd35e-60cf-4435-8b92-679e8dacd823',
        categoryID: 'nxEz7KL498BqbGAzJ46w',
        marketID: 'XAL9zcVqDlTWE9j98pbZ',
      },
    ],
    ids: ['nxEz7KL498BqbGAzJ46w'],
  },
  isExclusive: true,
  unitsSold: 237,
  price: 4.99,
  marketID: ['XAL9zcVqDlTWE9j98pbZ'],
  constraints: {
    max: null,
  },
  productID: 'uZyqOprEHbyP6YDJzj04',
  shortDescription:
    'Hamburguesa con 200 gramos de carne, queso cheddar, lechuga, tomate, pan de la casa y aderezo secreto (picante).',
  priority: 990,
  hasLongDistanceDelivery: false,
  mainMarket: 'XAL9zcVqDlTWE9j98pbZ',
  movements: null,
  isAvailable: true,
  affiliate: {
    name: 'Tres Puntos',
    affiliateID: 'XAL9zcVqDlTWE9j98pbZ',
  },
  productCategory: 'Burgers',
  name: 'Burger Suprema de Carne',
  promo: 0,
  createdAt: null,
  cravingIndex: null,
  paysPromo: 0,
  isSubproduct: false,
  measure: null,
  tags: ['burger suprema', 'hamburguesa', 'clasica', 'carne'],
  rating: 5,
  status: 'active',
  deliveryType: 1,
  hasFreeDelivery: false,
  options: [
    {
      iterable: 1,
      order: 1,
      required: false,
      label: 'Extras de la Burger',
      elements: [
        {
          key: 'Extra de Tocineta-0-0',
          hasMultiplier: false,
          value: 0.99,
          showShortDescription: false,
          usePrice: true,
          stock: 1000,
          label: 'Extra de Tocineta',
          required: false,
          showImage: false,
          inStock: true,
          productID: null,
          isLegacy: true,
          isAvailable: true,
        },
        {
          label: 'Extra de Carne (200 Gr)',
          inStock: true,
          hasMultiplier: false,
          usePrice: true,
          required: false,
          stock: 1000,
          isAvailable: true,
          showShortDescription: false,
          isLegacy: true,
          productID: null,
          showImage: false,
          value: 2.99,
          key: 'Extra de Carne (200 Gr)-0-1',
        },
        {
          isLegacy: true,
          showImage: false,
          hasMultiplier: false,
          value: 2.99,
          isAvailable: true,
          inStock: true,
          productID: null,
          showShortDescription: false,
          stock: 1000,
          key: 'Extra de Pollo (200 Gr)-0-2',
          required: false,
          label: 'Extra de Pollo (200 Gr)',
          usePrice: true,
        },
        {
          usePrice: true,
          value: 1.49,
          required: false,
          key: 'Queso Fundido-0-3',
          showImage: false,
          productID: null,
          stock: 1000,
          inStock: true,
          hasMultiplier: false,
          isLegacy: true,
          label: 'Queso Fundido',
          showShortDescription: false,
          isAvailable: true,
        },
      ],
      key: 'Extras de la Burger-0',
      controlType: 'checkbox',
    },
  ],
  categories: {
    categoriesDescriptions: [
      {
        parent: 'root',
        categoryID: 'R6JtZlEk1IwViiOvRbKM',
        name: 'Restaurant',
        affiliateID: 'XAL9zcVqDlTWE9j98pbZ',
        image: null,
      },
      {
        name: 'Burgers',
        marketID: 'XAL9zcVqDlTWE9j98pbZ',
        image:
          'https://firebasestorage.googleapis.com/v0/b/quik-test-d955c.appspot.com/o/test%2F1590339716432_Burger.svg?alt=media&token=908dd35e-60cf-4435-8b92-679e8dacd823',
        categoryID: 'nxEz7KL498BqbGAzJ46w',
      },
    ],
    ids: ['R6JtZlEk1IwViiOvRbKM', 'nxEz7KL498BqbGAzJ46w'],
  },
  barcode: '958261001999',
  pictures:
    'https://firebasestorage.googleapis.com/v0/b/quick-3909f.appspot.com/o/images%2F1594670695190_958261001999.jpg?alt=media&token=9ca552c5-bea3-45ac-9aa9-21d2e26360fe',
  mergeAlgolia: true,
  stock: 1000,
  description:
    'Nuestra burger clasica con 200 gramos de carne, aderezo secreto (picante) Tres Puntos, pan de la casa, queso cheddar, lechuga y tomate y tostones.',
  magnitude: null,
  buyPrice: 0,
  inStock: true,
  promoValue: 0,
}

export const ProductMock: Product = {
  quantity: 0,
  total: 0,
  id: '628a9cf2394fe060d9551635',
  isSubproduct: false,
  stock: 100,
  rating: 5,
  market: '626a374e48d953beb475a2b2',
  isExclusive: true,
  tags: ['burger suprema', 'hamburguesa', 'clasica', 'carne'],
  description:
    'Nuestra burger clasica con 200 gramos de carne, aderezo secreto (picante) Tres Puntos, pan de la casa, queso cheddar, lechuga y tomate y tostones.',
  shortDescription:
    'Hamburguesa con 200 gramos de carne, queso cheddar, lechuga, tomate, pan de la casa y aderezo secreto (picante).',
  pictures:
    'https://firebasestorage.googleapis.com/v0/b/quick-3909f.appspot.com/o/images%2F1594670695190_958261001999.jpg?alt=media&token=9ca552c5-bea3-45ac-9aa9-21d2e26360fe',
  isAvailable: true,
  priority: 990,
  magnitude: 1,
  measure: 'U',
  name: 'Burger suprema de carne',
  productID: 'uZyqOprEHbyP6YDJzj04',
  price: 4.99,
  promoValue: 0,
  categories: ['626ccae78db2e18e4b57bf1a'],
  isPromo: false,
  options: [
    {
      usesPrice: false,
      selected: [],
      type: 'checkbox',
      label: 'Extras de la Burger',
      iterable: true,
      min: 0,
      max: 0,
      required: false,
      elements: [
        '628a9cf2394fe060d955162b',
        '628a9cf2394fe060d955162d',
        '628a9cf2394fe060d955162f',
        '628a9cf2394fe060d9551631',
      ],
    },
  ],
}
