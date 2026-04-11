import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  formatNumber,
  calculateCartTotal,
  calculateChange,
  isValidQuantity,
  isValidPrice,
  formatDate,
  generateTransactionId,
} from '../lib/format'

describe('Utilidades de Formateo POS', () => {
  describe('formatPrice()', () => {
    it('debe formatear precios correctamente en MXN', () => {
      expect(formatPrice(100)).toBe('$100.00')
      expect(formatPrice(100.5)).toBe('$100.50')
      expect(formatPrice(1000)).toBe('$1,000.00')
    })

    it('debe manejar strings numéricos', () => {
      expect(formatPrice('100')).toBe('$100.00')
      expect(formatPrice('100.50')).toBe('$100.50')
    })

    it('debe manejar valores inválidos', () => {
      expect(formatPrice('invalid')).toBe('$0.00')
      expect(formatPrice(NaN)).toBe('$0.00')
    })
  })

  describe('formatNumber()', () => {
    it('debe formatear números con separadores', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('debe manejar decimales', () => {
      expect(formatNumber(1000.5)).toBe('1,000.5')
    })
  })

  describe('calculateCartTotal()', () => {
    it('debe calcular total correctamente', () => {
      const items = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 3 },
      ]
      expect(calculateCartTotal(items)).toBe(350)
    })

    it('debe retornar 0 para carrito vacío', () => {
      expect(calculateCartTotal([])).toBe(0)
    })

    it('debe manejar cantidades con decimales', () => {
      const items = [{ price: 99.99, quantity: 1 }]
      expect(calculateCartTotal(items)).toBe(99.99)
    })
  })

  describe('calculateChange()', () => {
    it('debe calcular cambio correctamente', () => {
      expect(calculateChange(100, 150)).toBe(50)
      expect(calculateChange(100, 100)).toBe(0)
    })

    it('debe retornar 0 si pago es insuficiente', () => {
      expect(calculateChange(100, 50)).toBe(0)
    })
  })

  describe('isValidQuantity()', () => {
    it('debe validar cantidades correctamente', () => {
      expect(isValidQuantity(1)).toBe(true)
      expect(isValidQuantity(10)).toBe(true)
      expect(isValidQuantity(0)).toBe(false)
      expect(isValidQuantity(-1)).toBe(false)
      expect(isValidQuantity(1.5)).toBe(false)
    })
  })

  describe('isValidPrice()', () => {
    it('debe validar precios correctamente', () => {
      expect(isValidPrice(0)).toBe(true)
      expect(isValidPrice(100)).toBe(true)
      expect(isValidPrice(99.99)).toBe(true)
      expect(isValidPrice(-10)).toBe(false)
      expect(isValidPrice(NaN)).toBe(false)
    })
  })

  describe('formatDate()', () => {
    it('debe formatear fechas correctamente', () => {
      const date = new Date('2024-03-30T14:30:00')
      const result = formatDate(date)
      expect(result.length).toBeGreaterThan(0)
      expect(result).toBeTruthy()
    })

    it('debe manejar strings de fecha', () => {
      const result = formatDate('2024-03-30')
      expect(result.length).toBeGreaterThan(0)
      expect(result).toBeTruthy()
    })
  })

  describe('generateTransactionId()', () => {
    it('debe generar IDs únicos', () => {
      const id1 = generateTransactionId()
      const id2 = generateTransactionId()
      
      expect(id1).toMatch(/^TXN-[A-Z0-9]+-[A-Z0-9]+$/)
      expect(id2).toMatch(/^TXN-[A-Z0-9]+-[A-Z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('debe incluir prefijo TXN', () => {
      const id = generateTransactionId()
      expect(id.startsWith('TXN-')).toBe(true)
    })
  })
})
