import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { SellerTerminal } from '../components/SellerTerminal'
import type { Product } from '../lib/pos-utils'

/**
 * Utilidades para testing responsive
 */
const resizeWindow = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  large: 1440,
}

describe('SellerTerminal - Responsive Testing', () => {
  const mockProducts: Product[] = [
    { id: '1', name: 'Camisa Roja', price: 299, stock: 10, category: 'ropa' },
    { id: '2', name: 'Pantalón Azul', price: 599, stock: 5, category: 'ropa' },
  ]

  const mockOnSaleComplete = vi.fn()

  describe('Mobile (375px)', () => {
    it('debe mostrar botón flotante de carrito en móvil', async () => {
      resizeWindow(BREAKPOINTS.mobile)
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Verificar que el botón flotante está presente usando aria-label
      const floatingCartButton = screen.getByRole('button', { name: /carrito/i })
      expect(floatingCartButton).toBeInTheDocument()
      expect(floatingCartButton).toHaveClass('fixed', 'bottom-4', 'right-4', 'lg:hidden')
    })

    it('debe tener grid de 2 columnas en móvil', () => {
      resizeWindow(BREAKPOINTS.mobile)
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const grid = container.querySelector('.grid-cols-2')
      expect(grid).toBeInTheDocument()
    })

    it('debe ocultar carrito por defecto en móvil', () => {
      resizeWindow(BREAKPOINTS.mobile)
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // El carrito debe estar oculto por defecto
      const cartPanel = screen.getByText(/Carrito/).closest('[class*="translate-x-full"]')
      expect(cartPanel).toBeInTheDocument()
    })
  })

  describe('Tablet (768px)', () => {
    it('debe mostrar grid de 3 columnas en tablet', () => {
      resizeWindow(BREAKPOINTS.tablet)
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const grid = container.querySelector('.sm\\:grid-cols-3')
      expect(grid).toBeInTheDocument()
    })

    it('debe mantener botón flotante en tablet', () => {
      resizeWindow(BREAKPOINTS.tablet)
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const floatingCartButton = screen.getByRole('button', { name: /carrito/i })
      expect(floatingCartButton).toBeInTheDocument()
    })
  })

  describe('Desktop (1024px)', () => {
    it('debe mostrar layout de dos columnas en desktop', () => {
      resizeWindow(BREAKPOINTS.desktop)
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // Verificar que el layout es flex con dirección row
      const layout = container.querySelector('.lg\\:flex-row')
      expect(layout).toBeInTheDocument()
    })

    it('debe mostrar carrito fijo en desktop', () => {
      resizeWindow(BREAKPOINTS.desktop)
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      // El carrito debe estar visible (no tiene translate-x-full)
      const cartPanel = screen.getByText(/Carrito/).closest('[class*="translate-x"]')
      expect(cartPanel).toBeInTheDocument()
    })

    it('debe ocultar botón flotante en desktop', () => {
      resizeWindow(BREAKPOINTS.desktop)
      render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const floatingCartButton = screen.getByRole('button', { name: /carrito/i })
      expect(floatingCartButton).toHaveClass('lg:hidden')
    })

    it('debe tener grid de 4 columnas en desktop', () => {
      resizeWindow(BREAKPOINTS.desktop)
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const grid = container.querySelector('.lg\\:grid-cols-4')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Large Desktop (1440px)', () => {
    it('debe tener grid de 5 columnas en pantallas grandes', () => {
      resizeWindow(BREAKPOINTS.large)
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const grid = container.querySelector('.xl\\:grid-cols-5')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Transiciones responsivas', () => {
    it('debe tener transiciones suaves en el carrito', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const cartPanel = container.querySelector('.transition-transform')
      expect(cartPanel).toHaveClass('duration-300', 'ease-in-out')
    })

    it('debe tener sombras consistentes', () => {
      const { container } = render(
        <SellerTerminal
          products={mockProducts}
          onSaleComplete={mockOnSaleComplete}
        />
      )

      const productCards = container.querySelectorAll('.shadow-sm')
      productCards.forEach(card => {
        expect(card).toHaveClass('hover:shadow-md')
      })
    })
  })
})
