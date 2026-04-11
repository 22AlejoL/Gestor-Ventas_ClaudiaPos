// Test simple para verificar que el setup funciona
import { describe, it, expect } from 'vitest'

describe('Setup de Testing', () => {
  it('debe funcionar vitest correctamente', () => {
    expect(true).toBe(true)
  })

  it('debe poder hacer operaciones matemáticas', () => {
    expect(1 + 1).toBe(2)
  })
})
