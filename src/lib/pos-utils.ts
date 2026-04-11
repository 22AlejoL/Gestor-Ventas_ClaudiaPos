/**
 * Tipos y utilidades para el componente SellerTerminal
 */

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  stock: number
  category?: string
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image_url?: string
}

export interface SalesTerminalProps {
  products: Product[]
  onSaleComplete: (sale: {
    items: CartItem[]
    total: number
    paymentMethod: string
    change: number
  }) => void
  businessType?: 'clothing' | 'restaurant' | 'general'
}

/**
 * Utilidades para cálculos del terminal
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

export function calculateChange(total: number, payment: number): number {
  return Math.max(0, payment - total)
}

export function validateStock(items: CartItem[]): { valid: boolean; message?: string } {
  for (const item of items) {
    if (item.quantity > item.stock) {
      return { valid: false, message: `Stock insuficiente para ${item.name}` }
    }
  }
  return { valid: true }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

/**
 * Utilidades de filtrado y búsqueda
 */
export function filterProducts(products: Product[], searchTerm: string, category?: string): Product[] {
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !category || product.category === category
    return matchesSearch && matchesCategory && product.stock > 0
  })
}

/**
 * Utilidades para gestión del carrito
 */
export function addToCart(cart: CartItem[], product: Product, quantity: number = 1): CartItem[] {
  const existingItem = cart.find(item => item.id === product.id)
  
  if (existingItem) {
    const newQuantity = Math.min(existingItem.quantity + quantity, product.stock)
    return cart.map(item => 
      item.id === product.id 
        ? { ...item, quantity: newQuantity }
        : item
    )
  }
  
  return [...cart, {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: Math.min(quantity, product.stock),
    stock: product.stock,
    category: product.category,
  }]
}

export function removeFromCart(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter(item => item.id !== productId)
}

export function updateQuantity(cart: CartItem[], productId: string, newQuantity: number): CartItem[] {
  if (newQuantity <= 0) {
    return removeFromCart(cart, productId)
  }
  
  return cart.map(item => {
    if (item.id === productId) {
      const validQuantity = Math.min(newQuantity, item.stock)
      return { ...item, quantity: validQuantity }
    }
    return item
  })
}