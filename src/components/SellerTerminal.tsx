import React, { useState, useMemo } from 'react'
import { Search, ShoppingCart, Minus, Plus, Trash2, CreditCard, DollarSign } from 'lucide-react'
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
  type SalesTerminalProps,
} from '../lib/pos-utils'

/**
 * Componente SellerTerminal - Terminal de ventas responsive
 */
export const SellerTerminal: React.FC<SalesTerminalProps> = ({
  products,
  onSaleComplete,
  businessType = 'general',
}) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [showCart, setShowCart] = useState(false)

  // Filtrar productos
  const filteredProducts = useMemo(() => 
    filterProducts(products, searchTerm, selectedCategory),
    [products, searchTerm, selectedCategory]
  )

  // Categorías únicas
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return Array.from(cats)
  }, [products])

  // Cálculos
  const subtotal = useMemo(() => calculateCartTotal(cart), [cart])
  const payment = parseFloat(paymentAmount) || 0
  const change = calculateChange(subtotal, payment)
  const stockValidation = validateStock(cart)

  // Handlers
  const handleAddToCart = (product: Product) => {
    setCart(prevCart => addToCart(prevCart, product))
    setShowCart(true)
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCart(prevCart => updateQuantity(prevCart, productId, newQuantity))
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => removeFromCart(prevCart, productId))
  }

  const handleCompleteSale = () => {
    if (cart.length === 0) return
    if (!stockValidation.valid) {
      alert(stockValidation.message)
      return
    }
    if (payment < subtotal) {
      alert('Pago insuficiente')
      return
    }

    onSaleComplete({
      items: cart,
      total: subtotal,
      paymentMethod,
      change,
    })

    // Limpiar carrito
    setCart([])
    setPaymentAmount('')
    setShowCart(false)
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Panel de Productos - Mobile: Columna única, Desktop: 2/3 */}
      <div className="flex-1 p-4 overflow-hidden">
        {/* Barra de búsqueda y filtros */}
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === ''
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
              onClick={() => handleAddToCart(product)}
            >
              <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                <span className="text-gray-400 text-sm">{product.name}</span>
              </div>
              <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</p>
              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
            </div>
          ))}
        </div>

        {/* Mensaje sin resultados */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Panel del Carrito - Mobile: Overlay, Desktop: Sidebar */}
      <div className={`${
        showCart ? 'translate-x-0' : 'translate-x-full'
      } lg:translate-x-0 lg:w-96 bg-white shadow-lg transition-transform duration-300 ease-in-out fixed lg:relative inset-y-0 right-0 w-full max-w-md z-50`}>
        <div className="h-full flex flex-col">
          {/* Header del carrito */}
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrito ({cart.length})
            </h2>
            <button
              onClick={() => setShowCart(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Items del carrito */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{formatCurrency(item.price)}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer del carrito */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Resumen */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {/* Método de pago */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de pago:</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm flex items-center justify-center ${
                      paymentMethod === 'cash'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Efectivo
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm flex items-center justify-center ${
                      paymentMethod === 'card'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Tarjeta
                  </button>
                </div>
              </div>

              {/* Pago y cambio */}
              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Monto recibido"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  {payment > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Cambio:</span>
                      <span className="font-bold text-green-600">{formatCurrency(change)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de completar */}
              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || !stockValidation.valid || (paymentMethod === 'cash' && payment < subtotal)}
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Completar Venta ({formatCurrency(subtotal)})
              </button>

              {!stockValidation.valid && (
                <div className="text-xs text-red-600 text-center">
                  {stockValidation.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para móvil */}
      <button
        onClick={() => setShowCart(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg z-40 flex items-center"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {cart.length}
          </span>
        )}
      </button>
    </div>
  )
}

export default SellerTerminal