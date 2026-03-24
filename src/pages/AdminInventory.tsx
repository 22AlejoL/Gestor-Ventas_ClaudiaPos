import React, { useState } from 'react';
import { Package, TrendingUp, AlertCircle, Download, Plus, Search, Edit2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { User, Product, Business } from '../types';
import { cn } from '../lib/utils';
import { api } from '../services/api';
import StatCard from '../components/common/StatCard';

interface AdminInventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  user: User;
}

const AdminInventory = ({ products, setProducts, user }: AdminInventoryProps) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    if (user.role === 'OWNER') {
      api.getBusinessesByOwner(user.id).then(setBusinesses);
    }
  }, [user.id, user.role]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct({
      id: crypto.randomUUID(),
      name: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200&h=200',
      isUnlimited: false
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const businessIdInput = formData.get('businessId') as string;
    
    const updatedProduct: Product = {
      ...editingProduct!,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      cost: parseFloat(formData.get('cost') as string),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      minStock: parseInt(formData.get('minStock') as string),
      isUnlimited: formData.get('isUnlimited') === 'on',
      businessId: businessIdInput || editingProduct?.businessId || user.businessId
    };

    const isNew = !products.some(p => p.id === updatedProduct.id);
    if (isNew) {
      setProducts(prev => [updatedProduct, ...prev]);
    } else {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario y Rentabilidad</h2>
          <p className="text-slate-500">Gestiona tus productos y analiza márgenes</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <Download size={18} />
            Exportar CSV
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Valor Total Inventario" value={`$${products.reduce((acc, p) => acc + (p.stock * p.cost), 0).toLocaleString()}`} icon={Package} color="bg-indigo-600" />
        <StatCard title="Margen Promedio" value={`${(products.length > 0 ? (products.reduce((acc, p) => acc + ((p.price - p.cost) / p.price * 100), 0) / products.length) : 0).toFixed(1)}%`} icon={TrendingUp} color="bg-indigo-600" />
        <StatCard title="Productos Críticos" value={products.filter(p => !p.isUnlimited && p.stock <= p.minStock).length.toString()} icon={AlertCircle} color="bg-rose-500" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold">Todos</button>
            <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold">Bajo Stock</button>
            <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold">Sin Stock</button>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Producto</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold">Costo</th>
                <th className="px-6 py-4 font-bold">Precio</th>
                <th className="px-6 py-4 font-bold">Margen</th>
                <th className="px-6 py-4 font-bold">Stock</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(product => {
                const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <span className="font-bold text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{product.category}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">${product.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-600 font-bold">{margin}%</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {product.isUnlimited ? 'Ilimitado' : product.stock}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold",
                        product.isUnlimited ? "bg-indigo-50 text-indigo-600" : product.stock > product.minStock ? "bg-emerald-50 text-emerald-600" : product.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {product.isUnlimited ? 'Ilimitado' : product.stock > product.minStock ? 'Óptimo' : product.stock > 0 ? 'Crítico' : 'Agotado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {products.some(p => p.id === editingProduct.id) ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input name="name" defaultValue={editingProduct.name} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                {businesses.length > 1 && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa Destino</label>
                    <select name="businessId" defaultValue={editingProduct.businessId || user.businessId} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      {businesses.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
                  <input name="category" defaultValue={editingProduct.category} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Costo</label>
                  <input name="cost" type="number" step="0.01" defaultValue={editingProduct.cost} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingProduct.price} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Actual</label>
                  <input name="stock" type="number" defaultValue={editingProduct.stock} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Mínimo</label>
                  <input name="minStock" type="number" defaultValue={editingProduct.minStock} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl">
                  <input name="isUnlimited" type="checkbox" defaultChecked={editingProduct.isUnlimited} id="isUnlimited" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                  <label htmlFor="isUnlimited" className="text-sm font-bold text-indigo-900 cursor-pointer">Stock Ilimitado</label>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Guardar Cambios</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
