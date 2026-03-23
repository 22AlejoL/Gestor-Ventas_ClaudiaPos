export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  image?: string;
  isUnlimited?: boolean;
  businessId?: string;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: SaleItem[];
  paymentMethod: 'CASH' | 'CARD' | 'DIGITAL';
  sellerId: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  status: 'ACTIVE' | 'INACTIVE';
}
