/**
 * Utilidades de formateo para el sistema POS
 */

/**
 * Formatea un precio a formato de moneda
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) return '$0.00'
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice)
}

/**
 * Formatea una cantidad con separadores de miles
 */
export function formatNumber(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) return '0'
  
  return new Intl.NumberFormat('es-MX').format(numAmount)
}

/**
 * Calcula el total de un carrito
 */
export function calculateCartTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

/**
 * Calcula el cambio para una venta
 */
export function calculateChange(total: number, payment: number): number {
  return Math.max(0, payment - total)
}

/**
 * Valida si una cantidad es válida para ventas
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0
}

/**
 * Valida si un precio es válido
 */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && !isNaN(price) && price >= 0
}

/**
 * Formatea una fecha a formato legible
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Genera un ID único para transacciones
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `TXN-${timestamp}-${random}`.toUpperCase()
}