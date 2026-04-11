import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

/**
 * Utilidades para testing responsive
 */
export function setViewport(width: number, height: number = 768) {
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

/**
 * Breakpoints comunes para testing
 */
export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  large: 1440,
}

/**
 * Helper para testing de componentes responsive
 */
export function testResponsive(component: React.ReactElement) {
  return {
    mobile: () => {
      setViewport(BREAKPOINTS.mobile)
      return render(component)
    },
    tablet: () => {
      setViewport(BREAKPOINTS.tablet)
      return render(component)
    },
    desktop: () => {
      setViewport(BREAKPOINTS.desktop)
      return render(component)
    },
  }
}

/**
 * Mock de matchMedia para testing
 */
export function mockMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}
