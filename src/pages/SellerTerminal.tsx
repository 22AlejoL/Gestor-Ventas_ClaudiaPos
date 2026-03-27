import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, Trash2, Minus, Plus, Wallet, CreditCard, Smartphone } from 'lucide-react';
import { Business, Product, UserRole, Sale } from '../types';
import { cn } from '../lib/utils';
import InvoiceReceipt from '../components/common/InvoiceReceipt';
import BusinessScopePicker from '../components/common/BusinessScopePicker';

interface SellerTerminalProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  role: UserRole;
  sellerId: string;
  businessName?: string;
  onSaleComplete?: (sale: Sale) => Promise<{ ok: boolean; error?: string }>;
  ownerBusinesses?: Business[];
  selectedBusinessId?: string;
  onSelectedBusinessChange?: (businessId: string) => void;
  activeBusinessId?: string;
  requireBusinessSelection?: boolean;
}

const SellerTerminal = ({ products, setProducts, role, sellerId, businessName, onSaleComplete, ownerBusinesses = [], selectedBusinessId = 'ALL', onSelectedBusinessChange, activeBusinessId, requireBusinessSelection = false }: SellerTerminalProps) => {
  const [cart, setCart] = useState<{product: Product, qty: number, overridePrice?: number}[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'DIGITAL' | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role !== 'OWNER') return;
    setCart([]);
    setPaymentMethod(null);
  }, [selectedBusinessId, role]);

  const getProductMaxQty = (productId: string, fallbackProduct: Product) => {
    const latestProduct = products.find((p) => p.id === productId) || fallbackProduct;
    if (latestProduct.isUnlimited) return Number.POSITIVE_INFINITY;
    return Math.max(0, latestProduct.stock);
  };

  const addToCart = (product: Product) => {
    if (!product.isUnlimited && product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const maxQty = getProductMaxQty(existing.product.id, existing.product);
        if (existing.qty >= maxQty) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const maxQty = getProductMaxQty(item.product.id, item.product);
          const newQty = Math.min(maxQty, Math.max(0, item.qty + delta));
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const updatePrice = (productId: string, newPrice: number) => {
    if (role !== 'OWNER' && role !== 'SUPER_ADMIN') return;
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, overridePrice: newPrice } : item
    ));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => {
    const price = item.overridePrice !== undefined ? item.overridePrice : item.product.price;
    return acc + (price * item.qty);
  }, 0);

  const handleCompleteSale = async () => {
    if (!paymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    const resolvedBusinessId = role === 'OWNER'
      ? (selectedBusinessId !== 'ALL' ? selectedBusinessId : undefined)
      : activeBusinessId;

    if ((role === 'OWNER' && requireBusinessSelection) && !resolvedBusinessId) {
      alert('Debes seleccionar una empresa antes de completar la venta.');
      return;
    }

    const newSale: Sale = {
      id: `T-${Date.now()}`,
      date: new Date().toISOString(),
      total,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.qty,
        price: item.overridePrice !== undefined ? item.overridePrice : item.product.price,
      })),
      paymentMethod,
      sellerId,
      businessId: resolvedBusinessId
    };

    const saveResult = await onSaleComplete?.(newSale);
    if (saveResult && !saveResult.ok) {
      alert(saveResult.error || 'No se pudo guardar la venta. Verifica la empresa seleccionada e intenta de nuevo.');
      return;
    }

    setCart([]);
    setPaymentMethod(null); // Reset payment method
    setIsCheckoutOpen(false); // Close checkout, if it were open
    setCompletedSale(newSale);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    setCompletedSale(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar producto o código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-modern pl-12 pr-4 py-4 rounded-2xl bg-white shadow-sm"
          />
        </div>

        {role === 'OWNER' && ownerBusinesses.length > 0 && (
          <>
            <BusinessScopePicker
              businesses={ownerBusinesses}
              selectedBusiness={selectedBusinessId}
              onSelectBusiness={(businessId) => onSelectedBusinessChange?.(businessId)}
              allowAll={false}
              title="Empresa de la venta"
              helperText="Selecciona explícitamente desde qué empresa estás vendiendo."
            />
            {requireBusinessSelection && selectedBusinessId === 'ALL' && (
              <p className="text-xs text-rose-600 font-semibold px-1">Debes seleccionar una empresa para continuar.</p>
            )}
          </>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={!product.isUnlimited && product.stock <= 0}
              className="surface-card p-4 hover:shadow-md transition-all text-left group active:scale-95 disabled:opacity-50"
            >
              <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-xl mb-3" referrerPolicy="no-referrer" />
              <h4 className="font-bold text-slate-800 line-clamp-2 mb-1">{product.name}</h4>
              <p className="text-indigo-600 font-bold text-lg">${product.price.toFixed(2)}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  product.isUnlimited ? "bg-indigo-50 text-indigo-600" : product.stock > 10 ? "bg-emerald-50 text-emerald-600" : product.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                )}>
                  {product.isUnlimited ? 'Stock: Ilimitado' : `Stock: ${product.stock}`}
                </span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Order */}
      <div className="w-full lg:w-[400px] surface-panel shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-bottom border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Orden Actual</h3>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Vaciar Carrito"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                {cart.length} items
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-50">
              <ShoppingCart size={48} />
              <p className="font-medium">El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.product.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-slate-800 line-clamp-1">{item.product.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-slate-50 text-slate-500"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-700 min-w-[20px] text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)}
                        disabled={!item.product.isUnlimited && item.qty >= getProductMaxQty(item.product.id, item.product)}
                        className="p-1 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">x</span>
                    {(role === 'OWNER' || role === 'SUPER_ADMIN') ? (
                      <div className="relative flex items-center">
                        <span className="absolute left-1 text-[10px] text-slate-400">$</span>
                        <input 
                          type="number"
                          value={item.overridePrice !== undefined ? item.overridePrice : item.product.price}
                          onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                          className="w-16 pl-3 pr-1 py-0.5 text-xs font-bold text-indigo-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-500">${item.product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">${((item.overridePrice !== undefined ? item.overridePrice : item.product.price) * item.qty).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-800 font-bold text-xl pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all group",
                paymentMethod === 'CASH' ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white hover:border-indigo-500 hover:text-indigo-600"
              )}
            >
              <Wallet size={20} className={cn(paymentMethod === 'CASH' ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600")} />
              <span className="text-[10px] font-bold">Efectivo</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('CARD')}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all group",
                paymentMethod === 'CARD' ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white hover:border-indigo-500 hover:text-indigo-600"
              )}
            >
              <CreditCard size={20} className={cn(paymentMethod === 'CARD' ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600")} />
              <span className="text-[10px] font-bold">Tarjeta</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('DIGITAL')}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all group",
                paymentMethod === 'DIGITAL' ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white hover:border-indigo-500 hover:text-indigo-600"
              )}
            >
              <Smartphone size={20} className={cn(paymentMethod === 'DIGITAL' ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600")} />
              <span className="text-[10px] font-bold">Digital</span>
            </button>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={handleCompleteSale}
            className="btn-primary w-full py-4 rounded-2xl text-lg"
          >
            Completar Venta
          </button>
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {completedSale && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-emerald-50 text-emerald-600 font-bold text-center border-b border-emerald-100 relative">
              Venta Exitosa
              <button 
                onClick={handleNewSale}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-emerald-400 hover:text-emerald-600"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-y-auto print-receipt-container">
              <InvoiceReceipt ref={invoiceRef} sale={completedSale} businessName={businessName} />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleNewSale}
                className="btn-secondary flex-1 py-3 px-4"
              >
                Nueva Venta
              </button>
              <button
                onClick={handlePrint}
                className="btn-primary flex-1 py-3 px-4"
              >
                Imprimir Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerTerminal;
