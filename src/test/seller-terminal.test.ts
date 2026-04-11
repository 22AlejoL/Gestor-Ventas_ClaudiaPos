import { describe, it, expect } from 'vitest'
import {
  calculateCartTotal,
  calculateChange,
  validateStock,
  formatCurrency,
  filterProducts,
  addToCart,
  removeFromCart,
  updateQuantity,
  type CartItem,
  type Product,
} from '../lib/pos-utils'

describe('POS Utils - Seller Terminal', () => {
  describe('calculateCartTotal()', () => {
    it('debe calcular el total correctamente', () => {
      const items: CartItem[] = [
        { id: '1', name: 'Camisa', price: 299.99, quantity: 2, stock: 10 },
        { id: '2', name: 'Pantalón', price: 599.99, quantity: 1, stock: 5 },
      ]
      expect(calculateCartTotal(items)).toBe(1199.97)
    })

    it('debe retornar 0 para carrito vacío', () => {
      expect(calculateCartTotal([])).toBe(0)
    })

    it('debe manejar cantidades decimales', () => {
      const items: CartItem[] = [
        { id: '1', name: 'Producto', price: 99.99, quantity: 1.5, stock: 10 },
      ]
      expect(calculateCartTotal(items)).toBeCloseTo(149.985, 2)
    })
  })

  describe('calculateChange()', () => {
    it('debe calcular el cambio correctamente', () => {
      expect(calculateChange(100, 150)).toBe(50)
      expect(calculateChange(100, 100)).toBe(0)
    })

    it('debe retornar 0 si el pago es insuficiente', () => {
      expect(calculateChange(100, 50)).toBe(0)
    })

    it('debe manejar montos decimales', () => {
      expect(calculateChange(99.99, 150)).toBeCloseTo(50.01, 2)
    })
  })

  describe('validateStock()', () => {
    it('debe validar stock correctamente', () => {
      const items: CartItem[] = [
        { id: '1', name: 'Producto', price: 100, quantity: 2, stock: 5 },
      ]
      expect(validateStock(items)).toEqual({ valid: true })
    })

    it('debe detectar cuando hay stock insuficiente', () => {
      const items: CartItem[] = [
        { id: '1', name: 'Producto', price: 100, quantity: 10, stock: 5 },
      ]
      const result = validateStock(items)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('Stock insuficiente')
    })

    it('debe manejar carrito vacío', () => {
      expect(validateStock([])).toEqual({ valid: true })
    })
  })

  describe('formatCurrency()', () => {
    it('debe formatear correctamente en MXN', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(1000.5)).toBe('$1,000.50')
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('filterProducts()', () => {
    const mockProducts: Product[] = [
      { id: '1', name: 'Camisa Roja', price: 299, stock: 10, category: 'ropa' },
      { id: '2', name: 'Pantalón Azul', price: 599, stock: 5, category: 'ropa' },
      { id: '3', name: 'Zapatos Negros', price: 899, stock: 0, category: 'calzado' },
      { id: '4', name: 'Camisa Verde', price: 349, stock: 8, category: 'ropa' },
    ]

    it('debe filtrar por término de búsqueda', () => {
      const result = filterProducts(mockProducts, 'camisa')
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Camisa Roja')
    })

    it('debe filtrar por categoría', () => {
      const result = filterProducts(mockProducts, '', 'ropa')
      expect(result).toHaveLength(3)
      expect(result.every(p => p.category === 'ropa')).toBe(true)
    })

    it('debe filtrar por búsqueda y categoría', () => {
      const result = filterProducts(mockProducts, 'camisa', 'ropa')
      expect(result).toHaveLength(2)
    })

    it('debe excluir productos sin stock', () => {
      const result = filterProducts(mockProducts, 'zapatos')
      expect(result).toHaveLength(0)
    })

    it('debe ser case-insensitive', () => {
      const result = filterProducts(mockProducts, 'CAMISA')
      expect(result).toHaveLength(2)
    })
  })

  describe('Gestión del Carrito', () => {
    const mockProduct: Product = {
      id: '1',
      name: 'Camisa Test',
      price: 299,
      stock: 5,
      category: 'ropa',
    }

    let initialCart: CartItem[]

    beforeEach(() => {
      initialCart = [
        { id: '1', name: 'Camisa Test', price: 299, quantity: 1, stock: 5 },
        { id: '2', name: 'Pantalón Test', price: 599, quantity: 1, stock: 3 },
      ]
    })

    describe('addToCart()', () => {
      it('debe agregar nuevo producto al carrito', () => {
        const newProduct: Product = { id: '3', name: 'Zapatos', price: 899, stock: 2, category: 'calzado' }
        const result = addToCart(initialCart, newProduct)
        expect(result).toHaveLength(3)
        expect(result[2].name).toBe('Zapatos')
      })

      it('debe incrementar cantidad si producto ya existe', () => {
        const result = addToCart(initialCart, mockProduct)
        expect(result).toHaveLength(2)
        expect(result[0].quantity).toBe(2)
      })

      it('debe limitar cantidad al stock disponible', () => {
        const result = addToCart(initialCart, mockProduct, 10)
        expect(result[0].quantity).toBe(5) // Stock limit
      })
    })

    describe('removeFromCart()', () => {
      it('debe remover producto del carrito', () => {
        const result = removeFromCart(initialCart, '1')
        expect(result).toHaveLength(1)
        expect(result.some(item => item.id === '1')).toBe(false)
      })

      it('debe retornar carrito sin cambios si producto no existe', () => {
        const result = removeFromCart(initialCart, '99')
        expect(result).toHaveLength(2)
      })
    })

    describe('updateQuantity()', () => {
      it('debe actualizar cantidad correctamente', () => {
        const result = updateQuantity(initialCart, '1', 3)
        expect(result[0].quantity).toBe(3)
      })

      it('debe remover producto si cantidad es 0', () => {
        const result = updateQuantity(initialCart, '1', 0)
        expect(result).toHaveLength(1)
        expect(result.some(item => item.id === '1')).toBe(false)
      })

      it('debe limitar cantidad al stock disponible', () => {
        const result = updateQuantity(initialCart, '1', 10)
        expect(result[0].quantity).toBe(5) // Stock limit
      })
    })
  })
})
