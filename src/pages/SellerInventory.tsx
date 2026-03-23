import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Product } from '../types';
import { cn } from '../lib/utils';

interface SellerInventoryProps {
  products: Product[];
}

const SellerInventory = ({ products }: SellerInventoryProps) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Todos' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Consulta de Inventario</h2>
          <p className="text-slate-500">Consulta existencias y precios rápidamente</p>
        </div>
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Todos', 'Lácteos', 'Panadería', 'Abarrotes', 'Limpieza', 'Bebidas'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
              cat === category ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={product.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800">{product.name}</h4>
                <p className="text-xs text-slate-400">{product.category}</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-500">Precio</p>
                  <p className="font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Existencia</p>
                  <span className={cn(
                    "text-sm font-bold",
                    product.isUnlimited ? "text-indigo-600" : product.stock > 10 ? "text-emerald-600" : product.stock > 0 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {product.isUnlimited ? 'Ilimitado' : `${product.stock} pz`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerInventory;
