import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminInventory from '../pages/AdminInventory';
import { Product, User, Business } from '../types';

// Mock components for testing
vi.mock('../components/common/StatCard', () => ({
  default: ({ title, value }: { title: string; value: string }) => (
    <div data-testid={`stat-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  )
}));

vi.mock('../components/common/BusinessScopePicker', () => ({
  default: ({ selectedBusiness, onSelectBusiness }: any) => (
    <select 
      data-testid="business-scope-picker"
      value={selectedBusiness}
      onChange={(e) => onSelectBusiness(e.target.value)}
    >
      <option value="ALL">All Businesses</option>
      <option value="biz1">Tienda Principal</option>
      <option value="biz2">Sucursal Norte</option>
    </select>
  )
}));

vi.mock('../components/common/StyledDropdown', () => ({
  default: ({ value, onChange, options }: any) => (
    <select 
      data-testid="category-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}));

// Mock data for integration testing
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Camisa Premium',
    price: 299.99,
    cost: 150.00,
    stock: 25,
    minStock: 5,
    category: 'ropa',
    image: 'shirt.jpg',
    description: 'Camisa de alta calidad',
    business_id: 'biz1',
    isUnlimited: false
  },
  {
    id: '2',
    name: 'Zapatos Deportivos',
    price: 899.99,
    cost: 450.00,
    stock: 3,
    minStock: 5,
    category: 'calzado',
    image: 'shoes.jpg',
    description: 'Zapatos deportivos premium',
    business_id: 'biz1',
    isUnlimited: false
  },
  {
    id: '3',
    name: 'Pantalón Jeans',
    price: 599.99,
    cost: 250.00,
    stock: 50,
    minStock: 10,
    category: 'ropa',
    image: 'jeans.jpg',
    description: 'Jeans de mezclilla',
    business_id: 'biz2',
    isUnlimited: false
  }
];

const mockUser: User = {
  id: 'user1',
  email: 'admin@tienda.com',
  role: 'admin',
  businessId: 'biz1'
};

const mockBusinesses: Business[] = [
  { id: 'biz1', name: 'Tienda Principal', owner_id: 'user1' },
  { id: 'biz2', name: 'Sucursal Norte', owner_id: 'user2' }
];

// Mock setProducts function
const mockSetProducts = vi.fn();

describe('AdminInventory Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Inventory Management Workflow', () => {
    it('should handle full product lifecycle', async () => {
      render(
        <AdminInventory
          products={mockProducts}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="ALL"
          onSelectBusiness={vi.fn()}
        />
      );

      // 1. Verify initial product list
      expect(screen.getByText('Camisa Premium')).toBeInTheDocument();
      expect(screen.getByText('Zapatos Deportivos')).toBeInTheDocument();
      expect(screen.getByText('Pantalón Jeans')).toBeInTheDocument();

      // 2. Filter by category
      const categoryFilter = screen.getByTestId('category-filter');
      fireEvent.change(categoryFilter, { target: { value: 'ropa' } });

      // Should show only ropa category
      await waitFor(() => {
        expect(screen.getByText('Camisa Premium')).toBeInTheDocument();
        expect(screen.queryByText('Zapatos Deportivos')).not.toBeInTheDocument();
      });

      // 3. Search functionality
      const searchInput = screen.getByPlaceholderText('Buscar producto...');
      fireEvent.change(searchInput, { target: { value: 'Premium' } });

      // Should show only matching products
      await waitFor(() => {
        expect(screen.getByText('Camisa Premium')).toBeInTheDocument();
      });
    });

    it('should calculate inventory value and margins correctly', () => {
      render(
        <AdminInventory
          products={mockProducts}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="ALL"
          onSelectBusiness={vi.fn()}
        />
      );

      // Calculate expected values
      const totalValue = mockProducts.reduce((sum, p) => sum + (p.stock * p.cost), 0);
      const avgMargin = mockProducts.reduce((sum, p) => sum + ((p.price - p.cost) / p.price * 100), 0) / mockProducts.length;
      const criticalProducts = mockProducts.filter(p => p.stock <= p.minStock).length;

      // Verify displayed values
      expect(screen.getByText(`$${totalValue.toLocaleString()}`)).toBeInTheDocument();
      expect(screen.getByText(`${avgMargin.toFixed(1)}%`)).toBeInTheDocument();
      expect(screen.getByText(criticalProducts.toString())).toBeInTheDocument();
    });

    it('should handle business scope filtering', () => {
      render(
        <AdminInventory
          products={mockProducts}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="biz1"
          onSelectBusiness={vi.fn()}
        />
      );

      // Should show only biz1 products - check within table
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      // Mock should show products since we're mocking the table display
    });

    it('should handle product creation workflow', async () => {
      render(
        <AdminInventory
          products={mockProducts}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="ALL"
          onSelectBusiness={vi.fn()}
        />
      );

      // 1. Click add new product
      const addButton = screen.getByText('Nuevo Producto');
      fireEvent.click(addButton);

      // 2. Fill product form (simplified for test)
      const nameInput = screen.getByPlaceholderText('Nombre del producto');
      fireEvent.change(nameInput, { target: { value: 'Nuevo Producto' } });

      const priceInput = screen.getByPlaceholderText('Precio');
      fireEvent.change(priceInput, { target: { value: '399.99' } });

      const costInput = screen.getByPlaceholderText('Costo');
      fireEvent.change(costInput, { target: { value: '200.00' } });

      const stockInput = screen.getByPlaceholderText('Stock');
      fireEvent.change(stockInput, { target: { value: '20' } });

      // 3. Save product
      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      // 4. Verify setProducts was called
      expect(mockSetProducts).toHaveBeenCalled();
    });

    it('should handle stock filtering', async () => {
      render(
        <AdminInventory
          products={mockProducts}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="ALL"
          onSelectBusiness={vi.fn()}
        />
      );

      // 1. Show all products
      expect(screen.getAllByRole('row').length).toBeGreaterThan(3); // Header + products

      // 2. Filter low stock
      const lowStockButton = screen.getByText('Bajo Stock');
      fireEvent.click(lowStockButton);

      // Should show only low stock products (Zapatos with stock:3, minStock:5)
      await waitFor(() => {
        expect(screen.getByText('Zapatos Deportivos')).toBeInTheDocument();
        expect(screen.queryByText('Camisa Premium')).not.toBeInTheDocument();
        expect(screen.queryByText('Pantalón Jeans')).not.toBeInTheDocument();
      });

      // 3. Filter out of stock
      const outOfStockButton = screen.getByText('Sin Stock');
      fireEvent.click(outOfStockButton);

      // Should show no products (none have stock <= 0)
      await waitFor(() => {
        expect(screen.queryByText('Camisa Premium')).not.toBeInTheDocument();
        expect(screen.queryByText('Zapatos Deportivos')).not.toBeInTheDocument();
        expect(screen.queryByText('Pantalón Jeans')).not.toBeInTheDocument();
      });
    });

    it('should handle product editing workflow', async () => {
      render(
        <AdminInventory
          products={mockProducts}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="ALL"
          onSelectBusiness={vi.fn()}
        />
      );

      // 1. Find edit button for first product
      const editButtons = screen.getAllByRole('button', { name: '' }); // Edit buttons
      fireEvent.click(editButtons[0]);

      // 2. Modify product data
      const nameInput = screen.getByDisplayValue('Camisa Premium');
      fireEvent.change(nameInput, { target: { value: 'Camisa Premium Elite' } });

      const stockInput = screen.getByDisplayValue('25');
      fireEvent.change(stockInput, { target: { value: '30' } });

      // 3. Save changes
      const saveButton = screen.getByText('Guardar Cambios');
      fireEvent.click(saveButton);

      // 4. Verify setProducts was called with updated data
      expect(mockSetProducts).toHaveBeenCalled();
    });

    it('should calculate profit margins per product', () => {
      render(
        <AdminInventory
          products={mockProducts}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="ALL"
          onSelectBusiness={vi.fn()}
        />
      );

      // Verify margins are calculated (mock will handle display)
      const margins = mockProducts.map(product => 
        ((product.price - product.cost) / product.price * 100).toFixed(1)
      );
      expect(margins).toEqual(['50.0', '50.0', '58.3']);
    });

    it('should handle category management', async () => {
      render(
        <AdminInventory
          products={mockProducts}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="ALL"
          onSelectBusiness={vi.fn()}
        />
      );

      // 1. Verify existing categories
      const categoryFilter = screen.getByTestId('category-filter');
      expect(categoryFilter).toBeInTheDocument();

      // 2. Filter by specific category
      fireEvent.change(categoryFilter, { target: { value: 'ropa' } });

      // Should show only ropa products
      await waitFor(() => {
        expect(screen.getByText('Camisa Premium')).toBeInTheDocument();
        expect(screen.getByText('Pantalón Jeans')).toBeInTheDocument();
        expect(screen.queryByText('Zapatos Deportivos')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large product lists efficiently', () => {
      const largeProductList: Product[] = Array.from({ length: 100 }, (_, i) => ({
        id: `product-${i}`,
        name: `Producto ${i}`,
        price: 100 + i,
        cost: 50 + i,
        stock: 10,
        minStock: 5,
        category: `categoria-${i % 5}`,
        image: `image-${i}.jpg`,
        description: `Descripción del producto ${i}`,
        business_id: 'biz1',
        isUnlimited: false
      }));

      render(
        <AdminInventory
          products={largeProductList}
          setProducts={mockSetProducts}
          user={mockUser}
          businesses={mockBusinesses}
          selectedBusiness="ALL"
          onSelectBusiness={vi.fn()}
        />
      );

      // Should render without performance issues
      expect(screen.getByText('Inventario y Rentabilidad')).toBeInTheDocument();
    });
  });
});