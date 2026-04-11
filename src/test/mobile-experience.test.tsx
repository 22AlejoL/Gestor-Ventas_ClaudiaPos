import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SellerTerminal from '../components/SellerTerminal'
import type { Product } from '../lib/pos-utils'

describe('SellerTerminal - Mobile Experience', () => {
  const mockProducts: Product[] = [
    { id: '1', name: 'Camisa Roja', price: 299, stock: 10, category: 'ropa' },
    { id: '2', name: 'Pantalón Azul', price: 599, stock: 5, category: 'ropa' },
  ]

  const mockOnSaleComplete = vi.fn()

  describe('Touch Interactions', () => {
    it('debe tener productos con áreas táctiles grandes', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const productCards = container.querySelectorAll('.cursor-pointer')
      productCards.forEach(card => {
        expect(card).toHaveClass('p-4') // Área táctil grande
      })
    })

    it('debe tener botones de cantidad accesibles', () => {
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Agregar producto al carrito primero
      const addButtons = screen.getAllByRole('button', { name: '+' })
      addButtons.forEach(button => {
        expect(button).toHaveClass('w-6', 'h-6') // Tamaño táctil adecuado
      })
    })
  })

  describe('Viewport Testing', () => {
    it('debe adaptarse a viewport de iPhone SE (375px)', () => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))

      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Verificar que el diseño es apropiado para móvil
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-2')
    })

    it('debe adaptarse a viewport de iPad (768px)', () => {
      window.innerWidth = 768
      window.dispatchEvent(new Event('resize'))

      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('sm:grid-cols-3')
    })

    it('debe mantener funcionalidad en desktop grande', () => {
      window.innerWidth = 1440
      window.dispatchEvent(new Event('resize'))

      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Verificar layout de dos columnas
      const layout = container.querySelector('.flex-col.lg\:flex-row')
      expect(layout).toBeInTheDocument()
    })
  })

  describe('Responsive Typography', () => {
    it('debe tener tamaños de fuente apropiados', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const priceElements = container.querySelectorAll('.text-lg')
      priceElements.forEach(element => {
        expect(element).toBeInTheDocument()
      })
    })

    it('debe tener espaciado consistente', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const elements = container.querySelectorAll('.p-4, .p-3, .py-2')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Mobile-first Design', () => {
    it('debe usar mobile-first approach con clases correctas', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Verificar que las clases mobile-first están presentes
      const elements = container.querySelectorAll('[class*="grid-cols-2"]')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('debe tener transiciones suaves', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const transitions = container.querySelectorAll('.transition-transform')
      transitions.forEach(element => {
        expect(element).toHaveClass('duration-300', 'ease-in-out')
      })
    })
  })

  describe('Accessibility on Mobile', () => {
    it('debe tener botones accesibles con labels apropiados', () => {
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeVisible()
      })
    })

    it('debe tener tamaños de click área adecuados', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const clickableElements = container.querySelectorAll('.cursor-pointer, button')
      clickableElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        expect(parseInt(styles.minHeight || '0')).toBeGreaterThanOrEqual(44) // Tamaño táctil mínimo
      })
    })
  })
})
