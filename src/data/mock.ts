import { Product, Sale, Business } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Leche Deslactosada 1L', category: 'Lácteos', price: 25.50, cost: 18.00, stock: 45, minStock: 10, image: 'https://picsum.photos/seed/milk/200', isUnlimited: false },
  { id: '2', name: 'Pan Integral 500g', category: 'Panadería', price: 38.00, cost: 25.00, stock: 8, minStock: 15, image: 'https://picsum.photos/seed/bread/200', isUnlimited: false },
  { id: '3', name: 'Huevos Docena', category: 'Abarrotes', price: 42.00, cost: 32.00, stock: 0, minStock: 5, image: 'https://picsum.photos/seed/eggs/200', isUnlimited: false },
  { id: '4', name: 'Arroz Blanco 1kg', category: 'Abarrotes', price: 22.00, cost: 15.00, stock: 120, minStock: 20, image: 'https://picsum.photos/seed/rice/200', isUnlimited: true },
  { id: '5', name: 'Aceite Vegetal 900ml', category: 'Abarrotes', price: 45.00, cost: 35.00, stock: 30, minStock: 10, image: 'https://picsum.photos/seed/oil/200', isUnlimited: false },
  { id: '6', name: 'Detergente Líquido 3L', category: 'Limpieza', price: 115.00, cost: 85.00, stock: 15, minStock: 5, image: 'https://picsum.photos/seed/soap/200', isUnlimited: false },
];

export const MOCK_SALES: Sale[] = [
  { id: 'T-1001', date: '2026-03-23T10:30:00', total: 150.50, items: [], paymentMethod: 'CASH', sellerId: 'v1' },
  { id: 'T-1002', date: '2026-03-23T11:15:00', total: 85.00, items: [], paymentMethod: 'CARD', sellerId: 'v1' },
  { id: 'T-1003', date: '2026-03-23T12:45:00', total: 420.00, items: [], paymentMethod: 'DIGITAL', sellerId: 'v1' },
];

export const MOCK_BUSINESSES: Business[] = [
  { id: 'b1', name: 'Abarrotes Doña Claudia', ownerId: 'o1', status: 'ACTIVE' },
  { id: 'b2', name: 'Panadería El Sol', ownerId: 'o2', status: 'ACTIVE' },
  { id: 'b3', name: 'Farmacia Salud', ownerId: 'o3', status: 'INACTIVE' },
];
