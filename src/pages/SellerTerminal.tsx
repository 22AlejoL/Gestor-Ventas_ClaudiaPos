import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, Minus, Plus, Wallet, CreditCard, Smartphone } from 'lucide-react';
import { Product, UserRole, Sale } from '../types';
import { cn } from '../lib/utils';

interface SellerTerminalProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  role: UserRole;
  onSaleComplete?: (sale: Sale) => void;
}

const SellerTerminal = ({ products, setProducts, role, onSaleComplete }: SellerTerminalProps) => {
  const [cart, setCart] = useState<{product: Product, qty: number, overridePrice?: number}[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'DIGITAL' | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addToCart = (product: Product) => {
    if (!product.isUnlimited && product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(0, item.qty + delta);
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

  const handleCompleteSale = () => {
    if (!paymentMethod) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }

    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem && !p.isUnlimited) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      }
      return p;
    }));

    const newSale: Sale = {
      id: `T-${Date.now()}`,
      date: new Date().toISOString(),
      total,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        qty: item.qty,
        price: item.overridePrice !== undefined ? item.overridePrice : item.product.price,
      })),
      paymentMethod,
      sellerId: 'v1' // Placeholder, ideally this would come from auth context
    };

    onSaleComplete?.(newSale); // Call the persistence callback
    setCart([]);
    setPaymentMethod(null); // Reset payment method
    setIsCheckoutOpen(false); // Close checkout, if it were open
    alert('Venta completada con éxito');
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
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={!product.isUnlimited && product.stock <= 0}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group active:scale-95 disabled:opacity-50"
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
      <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col overflow-hidden">
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
                        className="p-1 hover:bg-slate-50 text-slate-500"
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
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Completar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerTerminal;
