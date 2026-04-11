import React, { useMemo, useState } from 'react';
import { Package, TrendingUp, AlertCircle, Download, Plus, Search, Edit2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { User, Product, Business } from '../types';
import { cn } from '../lib/utils';
import StatCard from '../components/common/StatCard';
import BusinessScopePicker from '../components/common/BusinessScopePicker';
import StyledDropdown from '../components/common/StyledDropdown';

interface AdminInventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  user: User;
  businesses: Business[];
  selectedBusiness: string;
  onSelectBusiness: (businessId: string) => void;
}

const AdminInventory = ({ products, setProducts, user, businesses, selectedBusiness, onSelectBusiness }: AdminInventoryProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBusinessId, setModalBusinessId] = useState<string>('');
  const [modalCategory, setModalCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const scopedProducts = selectedBusiness === 'ALL'
    ? products
    : products.filter((product) => product.businessId === selectedBusiness);

  const availableCategories = useMemo(() => {
    const fromProducts = scopedProducts.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...fromProducts, ...customCategories])).sort((a, b) => a.localeCompare(b));
  }, [scopedProducts, customCategories]);

  const filteredProducts = scopedProducts.filter((product) => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const matchesText =
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery);

    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;

    if (!matchesText || !matchesCategory) return false;
    if (stockFilter === 'ALL') return true;
    if (stockFilter === 'LOW') return !product.isUnlimited && product.stock > 0 && product.stock <= product.minStock;
    if (stockFilter === 'OUT') return !product.isUnlimited && product.stock <= 0;
    return true;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalBusinessId(product.businessId || (selectedBusiness !== 'ALL' ? selectedBusiness : user.businessId || ''));
    setModalCategory(product.category || '');
    setNewCategoryName('');
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
    setModalBusinessId(selectedBusiness !== 'ALL' ? selectedBusiness : user.businessId || businesses[0]?.id || '');
    setModalCategory(availableCategories[0] || '');
    setNewCategoryName('');
    setIsModalOpen(true);
  };

  const handleCreateCategory = () => {
    const normalized = newCategoryName.trim();
    if (!normalized) return;

    const exists = availableCategories.some((category) => category.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      setModalCategory(availableCategories.find((category) => category.toLowerCase() === normalized.toLowerCase()) || normalized);
      setNewCategoryName('');
      return;
    }

    setCustomCategories((prev) => [...prev, normalized]);
    setModalCategory(normalized);
    setNewCategoryName('');
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const businessIdInput = modalBusinessId;
    
    const updatedProduct: Product = {
      ...editingProduct!,
      name: formData.get('name') as string,
      category: modalCategory,
      cost: parseFloat(formData.get('cost') as string),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      minStock: parseInt(formData.get('minStock') as string),
      isUnlimited: formData.get('isUnlimited') === 'on',
      businessId: businessIdInput || editingProduct?.businessId || (selectedBusiness !== 'ALL' ? selectedBusiness : user.businessId)
    };

    const isNew = !products.some(p => p.id === updatedProduct.id);
    if (!updatedProduct.category) return;

    if (isNew) {
      setProducts(prev => [updatedProduct, ...prev]);
    } else {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6" data-testid="admin-inventory-container">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="section-title">Inventario y Rentabilidad</h2>
          <p className="section-subtitle">Gestiona tus productos y analiza márgenes</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="w-full md:w-auto min-w-[320px]">
            <BusinessScopePicker
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={onSelectBusiness}
              title="Inventario por empresa"
              allLabel="Consolidado Global"
              className="py-3"
            />
          </div>
          <button className="btn-secondary">
            <Download size={18} />
            Exportar CSV
          </button>
          <button 
            onClick={handleAddNew}
            className="btn-primary"
            data-testid="add-product-button"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Valor Total Inventario" value={`$${filteredProducts.reduce((acc, p) => acc + (p.stock * p.cost), 0).toLocaleString()}`} icon={Package} color="bg-indigo-600" />
        <StatCard title="Margen Promedio" value={`${(filteredProducts.length > 0 ? (filteredProducts.reduce((acc, p) => acc + ((p.price - p.cost) / p.price * 100), 0) / filteredProducts.length) : 0).toFixed(1)}%`} icon={TrendingUp} color="bg-indigo-600" />
        <StatCard title="Productos Críticos" value={filteredProducts.filter(p => !p.isUnlimited && p.stock <= p.minStock).length.toString()} icon={AlertCircle} color="bg-rose-500" />
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStockFilter('ALL')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold transition-colors',
                stockFilter === 'ALL' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold transition-colors',
                stockFilter === 'LOW' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              Bajo Stock
            </button>
            <button
              onClick={() => setStockFilter('OUT')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold transition-colors',
                stockFilter === 'OUT' ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              Sin Stock
            </button>
            <div className="w-56">
              <StyledDropdown data-testid="category-filter"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'ALL', label: 'Todas las categorias' },
                  ...availableCategories.map((category) => ({ value: category, label: category }))
                ]}
              />
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern pl-10" data-testid="search-input"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead className="table-head">
              <tr>
                <th className="table-head-cell">Producto</th>
                <th className="table-head-cell">Categoría</th>
                <th className="table-head-cell">Costo</th>
                <th className="table-head-cell">Precio</th>
                <th className="table-head-cell">Margen</th>
                <th className="table-head-cell">Stock</th>
                <th className="table-head-cell">Estado</th>
                <th className="table-head-cell"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
                return (
                  <tr key={product.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <span className="font-bold text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-500 text-sm">{product.category}</td>
                    <td className="table-cell text-slate-800 font-medium">${product.cost.toFixed(2)}</td>
                    <td className="table-cell text-slate-800 font-medium">${product.price.toFixed(2)}</td>
                    <td className="table-cell">
                      <span className="text-emerald-600 font-bold">{margin}%</span>
                    </td>
                    <td className="table-cell font-bold text-slate-800">
                      {product.isUnlimited ? 'Ilimitado' : product.stock}
                    </td>
                    <td className="table-cell">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold",
                        product.isUnlimited ? "bg-indigo-50 text-indigo-600" : product.stock > product.minStock ? "bg-emerald-50 text-emerald-600" : product.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {product.isUnlimited ? 'Ilimitado' : product.stock > product.minStock ? 'Óptimo' : product.stock > 0 ? 'Crítico' : 'Agotado'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
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
            className="surface-panel w-full max-w-lg overflow-hidden shadow-2xl"
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
                  <input name="name" defaultValue={editingProduct.name} required className="input-modern px-4 py-2" />
                </div>
                {businesses.length > 1 && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa Destino</label>
                    <StyledDropdown data-testid="category-filter"
                      value={modalBusinessId}
                      onChange={setModalBusinessId}
                      searchable
                      options={businesses.map((business) => ({ value: business.id, label: business.name }))}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
                  <StyledDropdown data-testid="category-filter"
                    value={modalCategory}
                    onChange={setModalCategory}
                    options={availableCategories.map((category) => ({ value: category, label: category }))}
                    placeholder="Selecciona una categoria"
                    searchable
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nueva Categoría</label>
                  <div className="flex gap-2">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ej. Congelados"
                      className="input-modern px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="btn-secondary whitespace-nowrap"
                    >
                      Crear
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Costo</label>
                  <input name="cost" type="number" step="0.01" defaultValue={editingProduct.cost} required className="input-modern px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingProduct.price} required className="input-modern px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Actual</label>
                  <input name="stock" type="number" defaultValue={editingProduct.stock} required className="input-modern px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Mínimo</label>
                  <input name="minStock" type="number" defaultValue={editingProduct.minStock} required className="input-modern px-4 py-2" />
                </div>
                <div className="col-span-2 flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl">
                  <input name="isUnlimited" type="checkbox" defaultChecked={editingProduct.isUnlimited} id="isUnlimited" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                  <label htmlFor="isUnlimited" className="text-sm font-bold text-indigo-900 cursor-pointer">Stock Ilimitado</label>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 py-3">Guardar Cambios</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
