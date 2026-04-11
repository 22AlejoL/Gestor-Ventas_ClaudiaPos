import React, { useState } from 'react'
import SellerTerminal from '../components/SellerTerminal'
import type { Product } from '../lib/pos-utils'

/**
 * Demo de responsividad - Componente para verificar comportamiento
 */
const ResponsiveDemo: React.FC = () => {
  const [currentDevice, setCurrentDevice] = useState('desktop')
  
  const mockProducts: Product[] = [
    { id: '1', name: 'Camisa Premium', price: 299, stock: 15, category: 'ropa' },
    { id: '2', name: 'Pantalón Jeans', price: 599, stock: 8, category: 'ropa' },
    { id: '3', name: 'Zapatos Deportivos', price: 899, stock: 12, category: 'calzado' },
    { id: '4', name: 'Gorra Estilizada', price: 199, stock: 20, category: 'accesorios' },
    { id: '5', name: 'Chaqueta Invierno', price: 1299, stock: 5, category: 'ropa' },
    { id: '6', name: 'Mochila Urbana', price: 699, stock: 10, category: 'accesorios' },
  ]

  const handleSaleComplete = (sale: any) => {
    alert(`Venta completada: ${sale.total}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Controles de demo */}
      <div className="bg-white shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Demo Responsive POS</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDevice('mobile')}
              className={`px-3 py-1 rounded text-sm ${
                currentDevice === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              📱 Móvil
            </button>
            <button
              onClick={() => setCurrentDevice('tablet')}
              className={`px-3 py-1 rounded text-sm ${
                currentDevice === 'tablet' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setCurrentDevice('desktop')}
              className={`px-3 py-1 rounded text-sm ${
                currentDevice === 'desktop' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              💻 Desktop
            </button>
          </div>
        </div>
      </div>

      {/* Información del dispositivo actual */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Dispositivo Actual: {currentDevice}</h2>
          <div className="text-sm text-blue-600">
            <p>• <strong>Móvil:</strong> 375px - Botón flotante, grid 2 columnas</p>
            <p>• <strong>Tablet:</strong> 768px - Grid 3 columnas</p>
            <p>• <strong>Desktop:</strong> 1024px+ - Layout de dos columnas</p>
          </div>
        </div>
      </div>

      {/* Contenedor responsive */}
      <div className={`mx-auto ${
        currentDevice === 'mobile' ? 'max-w-sm' :
        currentDevice === 'tablet' ? 'max-w-2xl' :
        'max-w-7xl'
      }`}>
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={handleSaleComplete}
        />
      </div>

      {/* Indicador de viewport */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
        Viewport: {currentDevice}
      </div>
    </div>
  )
}

export default ResponsiveDemo