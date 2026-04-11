export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  businessName?: string;
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
  sellerName?: string;
  businessId?: string;
}

export interface SaleItem {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// Cash Register Types
export interface CashRegisterOpening {
  id: string;
  sellerId: string;
  sellerName?: string;
  businessId?: string;
  date: string;
  initialAmount: number;
  createdAt: string;
}

export interface CashRegisterClosure {
  id: string;
  sellerId: string;
  sellerName?: string;
  businessId?: string;
  date: string;
  openingId: string;
  initialAmount: number;
  finalAmount: number;
  expenses: number;
  expensesDetails?: string;
  difference: number;
  paymentBreakdown: {
    cash: number;
    card: number;
    digital: number;
  };
  totalSales: number;
  createdAt: string;
}

export interface Expense {
  description: string;
  amount: number;
}
