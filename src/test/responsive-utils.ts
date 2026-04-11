/**
 * Utilidades avanzadas para testing responsive
 */

import { act } from '@testing-library/react'

/**
 * Simula diferentes dispositivos para testing
 */
export const devices = {
  iphoneSE: { width: 375, height: 667 },
  iphone12: { width: 390, height: 844 },
  ipad: { width: 768, height: 1024 },
  ipadPro: { width: 1024, height: 1366 },
  desktop: { width: 1440, height: 900 },
  largeDesktop: { width: 1920, height: 1080 },
}

/**
 * Configura el viewport para testing responsive
 */
export function setViewport(width: number, height: number = 800) {
  act(() => {
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
  })
}

/**
 * Helper para testing de componentes en diferentes dispositivos
 */
export function withDevice(device: keyof typeof devices, callback: () => void) {
  const originalWidth = window.innerWidth
  const originalHeight = window.innerHeight
  
  setViewport(devices[device].width, devices[device].height)
  
  try {
    callback()
  } finally {
    setViewport(originalWidth, originalHeight)
  }
}

/**
 * Verifica si un elemento es visible en el viewport actual
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}

/**
 * Verifica clases responsive de Tailwind
 */
export function hasResponsiveClass(element: HTMLElement, classes: string[]): boolean {
  return classes.some(className => element.classList.contains(className))
}

/**
 * Testing de interacciones táctiles
 */
export function simulateTouch(element: HTMLElement) {
  const touchEvent = new TouchEvent('touchstart', {
    touches: [new Touch({
      identifier: 1,
      target: element,
      clientX: 0,
      clientY: 0,
    })],
  })
  element.dispatchEvent(touchEvent)
}

/**
 * Simula orientación landscape/portrait
 */
export function setOrientation(orientation: 'portrait' | 'landscape') {
  const width = orientation === 'portrait' ? 375 : 812
  const height = orientation === 'portrait' ? 812 : 375
  setViewport(width, height)
}

/**
 * Mock de matchMedia para testing responsive
 */
export function setupMatchMediaMock(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

/**
 * Helper para testing de grid responsivo
 */
export function testResponsiveGrid(element: HTMLElement, expectedClasses: string[]) {
  expectedClasses.forEach(className => {
    expect(element).toHaveClass(className)
  })
}

/**
 * Testing de breakpoints específicos
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * Verifica responsive behavior en diferentes breakpoints
 */
export function testAtBreakpoint(breakpoint: keyof typeof breakpoints, testFn: () => void) {
  setViewport(breakpoints[breakpoint])
  testFn()
}

export default {
  devices,
  setViewport,
  withDevice,
  isElementVisible,
  hasResponsiveClass,
  simulateTouch,
  setOrientation,
  setupMatchMediaMock,
  testResponsiveGrid,
  testAtBreakpoint,
  breakpoints,
}