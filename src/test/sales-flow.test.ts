import { describe, it, expect } from 'vitest'
import { formatPrice, calculateCartTotal, isValidPrice } from '../lib/format'

/**
 * Test de integración para flujo de venta
 */
describe('Flujo de Venta - Integración', () => {
  it('debe procesar una venta completa correctamente', () => {
    // Simulamos un carrito de compras
    const cart = [
      { id: '1', name: 'Camisa', price: 299.99, quantity: 2 },
      { id: '2', name: 'Pantalón', price: 599.99, quantity: 1 },
    ]

    // Validamos que todos los precios sean válidos
    const allPricesValid = cart.every(item => isValidPrice(item.price))
    expect(allPricesValid).toBe(true)

    // Calculamos el total
    const total = calculateCartTotal(cart.map(item => ({ price: item.price, quantity: item.quantity })))
    expect(total).toBe(1199.97)

    // Formateamos el total para mostrar
    const formattedTotal = formatPrice(total)
    expect(formattedTotal).toBe('$1,199.97')

    // Calculamos el cambio
    const payment = 1500
    const change = payment - total
    const formattedChange = formatPrice(change)
    expect(formattedChange).toBe('$300.03')
  })

  it('debe manejar carrito vacío', () => {
    const emptyCart: Array<{ price: number; quantity: number }> = []
    
    const total = calculateCartTotal(emptyCart)
    expect(total).toBe(0)
    
    const formattedTotal = formatPrice(total)
    expect(formattedTotal).toBe('$0.00')
  })

  it('debe validar productos con precios inválidos', () => {
    const invalidCart = [
      { price: -10, quantity: 1 },
      { price: NaN, quantity: 2 },
    ]

    const hasInvalidPrices = invalidCart.some(item => !isValidPrice(item.price))
    expect(hasInvalidPrices).toBe(true)
  })
})
