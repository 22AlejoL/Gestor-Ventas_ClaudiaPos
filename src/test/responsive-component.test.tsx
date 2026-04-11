import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

/**
 * Componente simple de prueba para responsive design
 */
const ResponsiveTestComponent: React.FC = () => {
  return (
    <div className="w-full">
      <div className="hidden md:block">Desktop View</div>
      <div className="block md:hidden">Mobile View</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    </div>
  )
}

describe('ResponsiveTestComponent', () => {
  it('debe renderizar correctamente', () => {
    render(<ResponsiveTestComponent />)
    
    expect(screen.getByText('Mobile View')).toBeInTheDocument()
    expect(screen.getByText('Desktop View')).toBeInTheDocument()
  })

  it('debe tener clases responsivas correctas', () => {
    const { container } = render(<ResponsiveTestComponent />)
    
    const gridDiv = container.querySelector('.grid')
    expect(gridDiv).toHaveClass('grid-cols-1')
    expect(gridDiv).toHaveClass('md:grid-cols-2')
    expect(gridDiv).toHaveClass('lg:grid-cols-3')
  })
})
