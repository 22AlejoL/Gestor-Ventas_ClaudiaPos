import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminInventory from '../pages/AdminInventory';
import { Product, User, Business } from '../types';

// Mock data for testing
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product A',
    price: 100,
    stock: 50,
    category: 'Electronics',
    image: 'product-a.jpg',
    description: 'Test product A',
    business_id: 'biz1',
    cost: 50,
    minStock: 5,
    isUnlimited: false
  },
  {
    id: '2',
    name: 'Product B',
    price: 200,
    stock: 30,
    category: 'Clothing',
    image: 'product-b.jpg',
    description: 'Test product B',
    business_id: 'biz1',
    cost: 100,
    minStock: 5,
    isUnlimited: false
  }
];

const mockUser: User = {
  id: 'user1',
  email: 'test@example.com',
  role: 'admin',
  businessId: 'biz1'
};

const mockBusinesses: Business[] = [
  { id: 'biz1', name: 'Test Business', owner_id: 'user1' }
];

// Mock the components
vi.mock('../components/common/StatCard', () => ({
  default: ({ title, value }: { title: string; value: string }) => (
    <div data-testid="stat-card">
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
      <option value="biz1">Test Business</option>
    </select>
  )
}));

vi.mock('../components/common/StyledDropdown', () => ({
  default: ({ value, onChange, options, placeholder }: any) => (
    <select 
      data-testid="styled-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((option: any) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}));

describe('AdminInventory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should display title and subtitle', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(screen.getByText('Inventario y Rentabilidad')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tus productos y analiza márgenes')).toBeInTheDocument();
  });

  it('should display add product button', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();
  });

  it('should display product table headers', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Categoría')).toBeInTheDocument();
    expect(screen.getByText('Costo')).toBeInTheDocument();
    expect(screen.getByText('Precio')).toBeInTheDocument();
    expect(screen.getByText('Margen')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('should display products in table', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
  });

  it('should display search functionality', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(screen.getByPlaceholderText('Buscar producto...')).toBeInTheDocument();
  });

  it('should display category filter', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(screen.getByTestId('styled-dropdown')).toBeInTheDocument();
  });

  it('should display stock filter buttons', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Bajo Stock')).toBeInTheDocument();
    expect(screen.getByText('Sin Stock')).toBeInTheDocument();
  });

  it('should calculate and display product margins', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    // Should display 50% margin for Product A ((100-50)/100*100)
    const marginElements = screen.getAllByText('50.0%');
    expect(marginElements.length).toBeGreaterThan(0);
  });

  it('should display business scope picker', () => {
    render(
      <AdminInventory
        products={mockProducts}
        setProducts={vi.fn()}
        user={mockUser}
        businesses={mockBusinesses}
        selectedBusiness="ALL"
        onSelectBusiness={vi.fn()}
      />
    );
    
    expect(screen.getByTestId('business-scope-picker')).toBeInTheDocument();
  });
});