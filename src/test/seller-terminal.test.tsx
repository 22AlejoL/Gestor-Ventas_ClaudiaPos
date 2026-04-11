import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SellerTerminal from '../components/SellerTerminal'
import type { Product } from '../lib/pos-utils'

describe('SellerTerminal - Componente Principal', () => {
  const mockProducts: Product[] = [
    { id: '1', name: 'Camisa Roja', price: 299, stock: 10, category: 'ropa' },
    { id: '2', name: 'Pantalón Azul', price: 599, stock: 5, category: 'ropa' },
    { id: '3', name: 'Zapatos', price: 899, stock: 3, category: 'calzado' },
  ]

  const mockOnSaleComplete = vi.fn()

  beforeEach(() => {
    mockOnSaleComplete.mockClear()
  })

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente con productos', () => {
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument()
      expect(screen.getAllByText('Camisa Roja')).toHaveLength(2) // Nombre en placeholder y título
      expect(screen.getAllByText('$299.00')).toHaveLength(1)
    })

    it('debe mostrar carrito vacío inicialmente', () => {
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      expect(screen.getByText('Carrito vacío')).toBeInTheDocument()
    })

    it('debe mostrar todas las categorías', () => {
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      expect(screen.getByText('Todos')).toBeInTheDocument()
      expect(screen.getByText('ropa')).toBeInTheDocument()
      expect(screen.getByText('calzado')).toBeInTheDocument()
    })
  })

  describe('Búsqueda y filtrado', () => {
    it('debe filtrar productos por búsqueda', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const searchInput = screen.getByPlaceholderText('Buscar productos...')
      await user.type(searchInput, 'Camisa')

      // Verificar que solo se muestran productos de camisa
      const productCards = screen.getAllByRole('heading', { level: 3 })
      const productNames = productCards.map(card => card.textContent)
      expect(productNames).toContain('Camisa Roja')
      expect(productNames).not.toContain('Pantalón Azul')
    })

    it('debe filtrar por categoría', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const ropaButton = screen.getByText('ropa')
      await user.click(ropaButton)

      // Verificar productos visibles
      const productCards = screen.getAllByRole('heading', { level: 3 })
      const productNames = productCards.map(card => card.textContent)
      expect(productNames).toContain('Camisa Roja')
      expect(productNames).toContain('Pantalón Azul')
      expect(productNames).not.toContain('Zapatos')
    })
  })

  describe('Gestión del carrito', () => {
    it('debe agregar producto al carrito', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Buscar el título del producto (no el placeholder)
      const productTitles = screen.getAllByRole('heading', { level: 3 })
      const camisaTitle = productTitles.find(title => title.textContent === 'Camisa Roja')
      if (camisaTitle) {
        const card = camisaTitle.closest('.cursor-pointer')
        if (card) await user.click(card)
      }

      // Verificar que el carrito se actualiza
      expect(screen.getByText('Camisa Roja')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('debe incrementar cantidad al agregar producto existente', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const productCard = screen.getByText('Camisa Roja').closest('.cursor-pointer')
      if (productCard) {
        await user.click(productCard)
        await user.click(productCard)
      }

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('debe remover producto del carrito', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Agregar producto
      const productCard = screen.getByText('Camisa Roja').closest('.cursor-pointer')
      if (productCard) {
        await user.click(productCard)
      }

      // Remover producto
      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      expect(screen.queryByText('Camisa Roja')).not.toBeInTheDocument()
    })

    it('debe actualizar cantidad con botones +/-', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Agregar producto
      const productCard = screen.getByText('Camisa Roja').closest('.cursor-pointer')
      if (productCard) {
        await user.click(productCard)
      }

      // Incrementar
      const plusButton = screen.getByRole('button', { name: '+' })
      await user.click(plusButton)
      expect(screen.getByText('2')).toBeInTheDocument()

      // Decrementar
      const minusButton = screen.getByRole('button', { name: '-' })
      await user.click(minusButton)
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Cálculos y validaciones', () => {
    it('debe calcular subtotal correctamente', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Agregar productos
      const productCards = screen.getAllByText(/\$/).map(el => el.closest('.cursor-pointer'))
      for (const card of productCards.slice(0, 2)) {
        if (card) await user.click(card)
      }

      expect(screen.getByText('$898.00')).toBeInTheDocument() // 299 + 599
    })

    it('debe validar stock insuficiente', async () => {
      const user = userEvent.setup()
      
      // Crear producto con stock limitado
      const limitedProduct: Product[] = [
        { id: '1', name: 'Producto Limitado', price: 100, stock: 2, category: 'test' }
      ]

      render(
        <SellerTerminal
          products={limitedProduct}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Agregar más de lo disponible
      const productCard = screen.getByText('Producto Limitado').closest('.cursor-pointer')
      if (productCard) {
        await user.click(productCard)
        await user.click(productCard)
        await user.click(productCard) // Tercer click, debería limitar a 2
      }

      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Proceso de venta completo', () => {
    it('debe completar una venta exitosamente', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Agregar productos al carrito
      const productCards = screen.getAllByText(/\$/).map(el => el.closest('.cursor-pointer'))
      for (const card of productCards.slice(0, 2)) {
        if (card) await user.click(card)
      }

      // Seleccionar método de pago
      const cashButton = screen.getByText('Efectivo')
      await user.click(cashButton)

      // Ingresar monto
      const paymentInput = screen.getByPlaceholderText('Monto recibido')
      await user.type(paymentInput, '1000')

      // Completar venta
      const completeButton = screen.getByText(/Completar Venta/)
      await user.click(completeButton)

      expect(mockOnSaleComplete).toHaveBeenCalledWith({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            price: expect.any(Number),
            quantity: expect.any(Number),
          })
        ]),
        total: 898,
        paymentMethod: 'cash',
        change: 102,
      })
    })
  })

  describe('Responsive design', () => {
    it('debe mostrar/ocultar carrito en móvil', async () => {
      const user = userEvent.setup()
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Botón de carrito móvil debe estar presente
      const mobileCartButton = screen.getByRole('button', { name: /shoppingcart/i })
      expect(mobileCartButton).toBeInTheDocument()

      // Cerrar carrito
      const closeButton = screen.getByText('✕')
      await user.click(closeButton)
    })

    it('debe tener clases responsivas correctas', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Verificar grid responsivo
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-2')
      expect(grid).toHaveClass('sm:grid-cols-3')
      expect(grid).toHaveClass('md:grid-cols-4')
      expect(grid).toHaveClass('lg:grid-cols-4')
      expect(grid).toHaveClass('xl:grid-cols-5')
    })
  })
})
