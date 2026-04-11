import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SellerTerminal } from '../components/SellerTerminal';
import { Product } from '../lib/pos-utils';

// Mock products for integration testing
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Camisa Premium',
    price: 299.99,
    stock: 10,
    category: 'ropa',
    image: 'shirt.jpg',
    description: 'Camisa de algodón premium',
    business_id: 'biz1'
  },
  {
    id: '2',
    name: 'Zapatos Deportivos',
    price: 899.99,
    stock: 5,
    category: 'calzado',
    image: 'shoes.jpg',
    description: 'Zapatos deportivos cómodos',
    business_id: 'biz1'
  },
  {
    id: '3',
    name: 'Pantalón Jeans',
    price: 599.99,
    stock: 8,
    category: 'ropa',
    image: 'jeans.jpg',
    description: 'Jeans de mezclilla',
    business_id: 'biz1'
  }
];

describe('Complete Sales Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset any global state
    window.innerWidth = 1200;
    window.dispatchEvent(new Event('resize'));
  });

  describe('End-to-End Sales Process', () => {
    it('should complete a full sale from product selection to payment', async () => {
      const mockOnSaleComplete = vi.fn();
      render(<SellerTerminal products={mockProducts} onSaleComplete={mockOnSaleComplete} />);

      // 1. Search for a product
      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      fireEvent.change(searchInput, { target: { value: 'Camisa' } });

      // 2. Add product to cart by clicking on product card
      const productCard = screen.getByText('Camisa Premium').closest('.cursor-pointer');
      expect(productCard).toBeInTheDocument();
      if (productCard) fireEvent.click(productCard);

      // 3. Verify cart shows product
      await waitFor(() => {
        expect(screen.getByText('Camisa Premium')).toBeInTheDocument();
      });

      // 4. Update quantity
      const increaseButton = screen.getByRole('button', { name: '+' });
      fireEvent.click(increaseButton);

      // 5. Verify total calculation
      const expectedTotal = '$599.98'; // 299.99 * 2
      expect(screen.getByText(expectedTotal)).toBeInTheDocument();

      // 6. Process payment
      const cashButton = screen.getByRole('button', { name: /efectivo/i });
      expect(cashButton).toBeInTheDocument();
      
      const paymentInput = screen.getByPlaceholderText('Monto recibido');
      fireEvent.change(paymentInput, { target: { value: '700' } });

      const expectedChange = '$100.02';
      expect(screen.getByText(expectedChange)).toBeInTheDocument();

      // 7. Complete sale
      const completeButton = screen.getByRole('button', { name: /completar venta/i });
      expect(completeButton).toBeEnabled();
    });

    it('should handle multiple products with different quantities', async () => {
      const mockOnSaleComplete = vi.fn();
      render(<SellerTerminal products={mockProducts} onSaleComplete={mockOnSaleComplete} />);

      // Add multiple products by clicking on product cards
      const productCards = screen.getAllByText(/\$|Stock/).map(text => text.closest('.cursor-pointer'));
      expect(productCards.length).toBeGreaterThan(0);
      
      if (productCards[0]) fireEvent.click(productCards[0]); // Camisa Premium
      if (productCards[1]) fireEvent.click(productCards[1]); // Zapatos Deportivos
      if (productCards[2]) fireEvent.click(productCards[2]); // Pantalón Jeans

      // Update quantities
      const increaseButtons = screen.getAllByRole('button', { name: '+' });
      fireEvent.click(increaseButtons[0]); // Camisa x2
      fireEvent.click(increaseButtons[1]); // Zapatos x2

      // Verify multi-product calculation
      const expectedTotal = '$2,699.95'; // (299.99 * 2) + (899.99 * 2) + 599.99
      expect(screen.getByText(expectedTotal)).toBeInTheDocument();
    });

    it('should handle stock validation across multiple products', async () => {
      const mockOnSaleComplete = vi.fn();
      render(<SellerTerminal products={mockProducts} onSaleComplete={mockOnSaleComplete} />);

      // Try to add more than available stock
      const productCards = screen.getAllByText(/Zapatos Deportivos/).map(text => text.closest('.cursor-pointer'));
      if (productCards[0]) fireEvent.click(productCards[0]); // Zapatos (stock: 5)

      // Try to increase quantity beyond stock
      const increaseButton = screen.getAllByRole('button', { name: '+' })[0];
      for (let i = 0; i < 5; i++) {
        fireEvent.click(increaseButton);
      }

      // Should disable increase button at max stock
      const buttons = screen.getAllByRole('button', { name: '+' });
      expect(buttons[0]).toBeDisabled();
    });
  });

  describe('Responsive Sales Workflow', () => {
    it('should work on mobile devices with floating cart', () => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(<SellerTerminal products={mockProducts} />);

      // Verify mobile layout
      const mobileCart = container.querySelector('.fixed.bottom-4.right-4');
      expect(mobileCart).toBeInTheDocument();

      // Verify touch-friendly buttons
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-12');
      });
    });

    it('should work on tablet devices', () => {
      window.innerWidth = 768;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(<SellerTerminal products={mockProducts} />);

      // Verify tablet layout (3-4 columns)
      const grid = container.querySelector('.grid-cols-3, .grid-cols-4');
      expect(grid).toBeInTheDocument();
    });

    it('should work on desktop with fixed sidebar', () => {
      window.innerWidth = 1200;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(<SellerTerminal products={mockProducts} />);

      // Verify desktop layout
      const desktopLayout = container.querySelector('.lg\:flex-row');
      expect(desktopLayout).toBeInTheDocument();

      // Verify cart is visible by default
      const cartSidebar = container.querySelector('.lg\:translate-x-0');
      expect(cartSidebar).toBeInTheDocument();
    });
  });

  describe('Payment Processing', () => {
    it('should calculate change correctly', async () => {
      render(<SellerTerminal products={mockProducts} />);

      // Add product and go to payment
      const addButtons = screen.getAllByRole('button', { name: /agregar/i });
      fireEvent.click(addButtons[0]);

      const paymentButton = screen.getByRole('button', { name: /procesar pago/i });
      fireEvent.click(paymentButton);

      // Enter payment amount
      const paymentInput = screen.getByPlaceholderText(/monto recibido/i);
      fireEvent.change(paymentInput, { target: { value: '500' } });

      // Verify change calculation
      const expectedChange = formatCurrency(500 - 299.99);
      expect(screen.getByText(expectedChange)).toBeInTheDocument();
    });

    it('should validate payment amount', async () => {
      render(<SellerTerminal products={mockProducts} />);

      // Add product
      const addButtons = screen.getAllByRole('button', { name: /agregar/i });
      fireEvent.click(addButtons[0]);

      const paymentButton = screen.getByRole('button', { name: /procesar pago/i });
      fireEvent.click(paymentButton);

      // Enter insufficient payment
      const paymentInput = screen.getByPlaceholderText(/monto recibido/i);
      fireEvent.change(paymentInput, { target: { value: '100' } });

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/monto insuficiente/i)).toBeInTheDocument();
      });
    });
  });

  describe('Invoice Generation', () => {
    it('should generate invoice with correct details', async () => {
      const { container } = render(<SellerTerminal products={mockProducts} />);

      // Complete sale
      const addButtons = screen.getAllByRole('button', { name: /agregar/i });
      fireEvent.click(addButtons[0]);
      fireEvent.click(addButtons[2]);

      const paymentButton = screen.getByRole('button', { name: /procesar pago/i });
      fireEvent.click(paymentButton);

      // Verify invoice contains correct products
      await waitFor(() => {
        expect(screen.getByText('FACTURA')).toBeInTheDocument();
        expect(screen.getByText('Camisa Premium')).toBeInTheDocument();
        expect(screen.getByText('Pantalón Jeans')).toBeInTheDocument();
      });

      // Verify total calculation
      const expectedTotal = formatCurrency(299.99 + 599.99);
      expect(screen.getByText(expectedTotal)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty cart gracefully', async () => {
      render(<SellerTerminal products={mockProducts} />);

      const paymentButton = screen.getByRole('button', { name: /procesar pago/i });
      expect(paymentButton).toBeDisabled();

      // Should show appropriate message
      expect(screen.getByText(/carrito vacío/i)).toBeInTheDocument();
    });

    it('should handle product not found', async () => {
      render(<SellerTerminal products={mockProducts} />);

      // Search for non-existent product
      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      fireEvent.change(searchInput, { target: { value: 'Producto Inexistente' } });

      // Should show no results message
      await waitFor(() => {
        expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument();
      });
    });
  });
});