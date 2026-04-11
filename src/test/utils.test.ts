import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('Utilidades - cn()', () => {
  it('debe combinar clases de Tailwind correctamente', () => {
    const result = cn('bg-red-500', 'text-white')
    expect(result).toBe('bg-red-500 text-white')
  })

  it('debe eliminar clases duplicadas', () => {
    const result = cn('bg-red-500', 'bg-red-500', 'text-white')
    expect(result).toBe('bg-red-500 text-white')
  })

  it('debe manejar valores undefined y null', () => {
    const result = cn('bg-red-500', undefined, null, 'text-white')
    expect(result).toBe('bg-red-500 text-white')
  })

  it('debe manejar arrays de clases', () => {
    const result = cn(['bg-red-500', 'text-white'], 'font-bold')
    expect(result).toBe('bg-red-500 text-white font-bold')
  })

  it('debe manejar objetos de clases condicionales', () => {
    const result = cn('bg-red-500', { 'text-white': true, 'hidden': false })
    expect(result).toBe('bg-red-500 text-white')
  })
})
