import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Users, 
  Building2, 
  LogOut, 
  Bell, 
  HelpCircle, 
  Search,
  Menu,
  X,
  ChevronRight,
  Plus,
  Filter,
  Download,
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Printer,
  UserCheck,
  Globe,
  ShieldCheck,
  Briefcase,
  Edit2,
  Minus,
  Trash2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, UserRole, Product, Business, Sale } from './types';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Leche Deslactosada 1L', category: 'Lácteos', price: 25.50, cost: 18.00, stock: 45, minStock: 10, image: 'https://picsum.photos/seed/milk/200', isUnlimited: false },
  { id: '2', name: 'Pan Integral 500g', category: 'Panadería', price: 38.00, cost: 25.00, stock: 8, minStock: 15, image: 'https://picsum.photos/seed/bread/200', isUnlimited: false },
  { id: '3', name: 'Huevos Docena', category: 'Abarrotes', price: 42.00, cost: 32.00, stock: 0, minStock: 5, image: 'https://picsum.photos/seed/eggs/200', isUnlimited: false },
  { id: '4', name: 'Arroz Blanco 1kg', category: 'Abarrotes', price: 22.00, cost: 15.00, stock: 120, minStock: 20, image: 'https://picsum.photos/seed/rice/200', isUnlimited: true },
  { id: '5', name: 'Aceite Vegetal 900ml', category: 'Abarrotes', price: 45.00, cost: 35.00, stock: 30, minStock: 10, image: 'https://picsum.photos/seed/oil/200', isUnlimited: false },
  { id: '6', name: 'Detergente Líquido 3L', category: 'Limpieza', price: 115.00, cost: 85.00, stock: 15, minStock: 5, image: 'https://picsum.photos/seed/soap/200', isUnlimited: false },
];

const MOCK_SALES: Sale[] = [
  { id: 'T-1001', date: '2026-03-23T10:30:00', total: 150.50, items: [], paymentMethod: 'CASH', sellerId: 'v1' },
  { id: 'T-1002', date: '2026-03-23T11:15:00', total: 85.00, items: [], paymentMethod: 'CARD', sellerId: 'v1' },
  { id: 'T-1003', date: '2026-03-23T12:45:00', total: 420.00, items: [], paymentMethod: 'DIGITAL', sellerId: 'v1' },
];

const MOCK_BUSINESSES: Business[] = [
  { id: 'b1', name: 'Abarrotes Doña Claudia', ownerId: 'o1', status: 'ACTIVE' },
  { id: 'b2', name: 'Panadería El Sol', ownerId: 'o2', status: 'ACTIVE' },
  { id: 'b3', name: 'Farmacia Salud', ownerId: 'o3', status: 'INACTIVE' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
    <span className="font-medium text-sm flex-1 text-left">{label}</span>
    {badge && (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold",
        active ? "bg-indigo-400 text-white" : "bg-red-100 text-red-600"
      )}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: { title: string, value: string, icon: any, trend?: 'up' | 'down', trendValue?: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
          trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
  </div>
);

const OwnerReports = () => {
  const data = [
    { name: 'Ene', ventas: 4000, meta: 3500 },
    { name: 'Feb', ventas: 3000, meta: 3500 },
    { name: 'Mar', ventas: 5000, meta: 4000 },
    { name: 'Abr', ventas: 4500, meta: 4000 },
    { name: 'May', ventas: 6000, meta: 4500 },
    { name: 'Jun', ventas: 7500, meta: 5000 },
  ];

  const pieData = [
    { name: 'Efectivo', value: 400, color: '#4f46e5' },
    { name: 'Tarjeta', value: 300, color: '#818cf8' },
    { name: 'Digital', value: 200, color: '#c7d2fe' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reportes de Rendimiento</h2>
          <p className="text-slate-500">Análisis detallado de ventas y rentabilidad</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Últimos 6 meses</option>
            <option>Este año</option>
            <option>Personalizado</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Flujo de Caja Mensual</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="ventas" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="meta" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Métodos de Pago</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{((item.value / 900) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Margen Promedio</p>
          <h4 className="text-2xl font-bold text-slate-800">32.4%</h4>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            +2.1% vs mes anterior
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Ticket Promedio</p>
          <h4 className="text-2xl font-bold text-slate-800">$342.50</h4>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            +5.4% vs mes anterior
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Clientes Nuevos</p>
          <h4 className="text-2xl font-bold text-slate-800">124</h4>
          <div className="mt-2 flex items-center gap-1 text-rose-600 text-xs font-bold">
            <ArrowDownRight size={14} />
            -1.2% vs mes anterior
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Retención</p>
          <h4 className="text-2xl font-bold text-slate-800">68%</h4>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            +0.5% vs mes anterior
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminInventory = ({ products, setProducts }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedProduct: Product = {
      ...editingProduct!,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      cost: parseFloat(formData.get('cost') as string),
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      minStock: parseInt(formData.get('minStock') as string),
      isUnlimited: formData.get('isUnlimited') === 'on'
    };

    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
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
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Valor Total Inventario" value={`$${products.reduce((acc, p) => acc + (p.stock * p.cost), 0).toLocaleString()}`} icon={Package} color="bg-indigo-600" />
        <StatCard title="Margen Promedio" value={`${(products.reduce((acc, p) => acc + ((p.price - p.cost) / p.price * 100), 0) / products.length).toFixed(1)}%`} icon={TrendingUp} color="bg-indigo-600" />
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
              <h3 className="text-xl font-bold text-slate-800">Editar Producto</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input name="name" defaultValue={editingProduct.name} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
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

const SuperAdminDueños = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Dueños</h2>
          <p className="text-slate-500">Administra las cuentas de dueños de negocio</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Plus size={18} />
          Nuevo Dueño
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Dueño</th>
                <th className="px-6 py-4 font-bold">Empresas</th>
                <th className="px-6 py-4 font-bold">Fecha Registro</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Carlos Ruiz', email: 'carlos@tienda.com', companies: 3, date: '2025-10-12', status: 'ACTIVE' },
                { name: 'Ana García', email: 'ana@pan.com', companies: 1, date: '2026-01-05', status: 'ACTIVE' },
                { name: 'Roberto Lima', email: 'roberto@farmacia.com', companies: 2, date: '2026-02-20', status: 'INACTIVE' },
              ].map((owner, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {owner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{owner.name}</p>
                        <p className="text-xs text-slate-400">{owner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{owner.companies}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{owner.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", owner.status === 'ACTIVE' ? "bg-emerald-500" : "bg-rose-500")} />
                      <span className="text-sm text-slate-600">{owner.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SuperAdminEmpresas = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Empresas</h2>
          <p className="text-slate-500">Monitorea todas las sucursales del sistema</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar empresa..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_BUSINESSES.map(business => (
          <div key={business.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Building2 size={24} />
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold",
                business.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {business.status}
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">{business.name}</h4>
            <p className="text-sm text-slate-500 mb-4">ID: {business.id}</p>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Dueño:</span>
                <span className="text-slate-700 font-medium">Carlos Ruiz</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ventas (Mes):</span>
                <span className="text-slate-700 font-medium">$12,450.00</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2 bg-slate-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
              Ver Detalles
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConfigurationView = ({ role }: { role: UserRole }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="text-indigo-600" />
          {role === 'SUPER_ADMIN' ? 'Configuración de Sistema' : role === 'OWNER' ? 'Configuración del Negocio' : 'Mi Perfil'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
              <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="Claudia Martínez" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
              <input type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="claudia@negocio.com" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
              <input type="tel" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="+52 55 1234 5678" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Idioma</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Español (México)</option>
                <option>English (US)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4">Notificaciones</h4>
          <div className="space-y-3">
            {[
              { label: 'Alertas de bajo stock', desc: 'Recibe un aviso cuando un producto esté por agotarse' },
              { label: 'Resumen diario de ventas', desc: 'Un reporte matutino con el cierre del día anterior' },
              { label: 'Nuevos inicios de sesión', desc: 'Seguridad: te avisamos si alguien entra a tu cuenta' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
          <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const Login = ({ onLogin }: { onLogin: (role: UserRole) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('admin')) onLogin('SUPER_ADMIN');
    else if (email.includes('owner')) onLogin('OWNER');
    else onLogin('SELLER');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <ShoppingCart className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">ClaudiaPOS</h1>
          <p className="text-slate-500 mt-2">Bienvenido de nuevo, ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@claudia.pos"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm">¿No tienes cuenta? <span className="text-indigo-600 font-bold cursor-pointer hover:underline">Contacta a soporte</span></p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Seller Views ---

const SellerTerminal = ({ products, setProducts, role }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, role: UserRole }) => {
  const [cart, setCart] = useState<{product: Product, qty: number, overridePrice?: number}[]>([]);
  const [search, setSearch] = useState('');

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
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem && !p.isUnlimited) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      }
      return p;
    }));
    setCart([]);
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
            <button className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:text-indigo-600 transition-all group">
              <Wallet size={20} className="text-slate-400 group-hover:text-indigo-600" />
              <span className="text-[10px] font-bold">Efectivo</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:text-indigo-600 transition-all group">
              <CreditCard size={20} className="text-slate-400 group-hover:text-indigo-600" />
              <span className="text-[10px] font-bold">Tarjeta</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:text-indigo-600 transition-all group">
              <Smartphone size={20} className="text-slate-400 group-hover:text-indigo-600" />
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

const SellerSummary = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resumen de mi Turno</h2>
          <p className="text-slate-500">Lunes, 23 de Marzo 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <Printer size={18} />
            Imprimir Corte
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <UserCheck size={18} />
            Asistencia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ventas Totales" value="$12,450.00" icon={DollarSign} color="bg-indigo-600" trend="up" trendValue="12%" />
        <StatCard title="Tickets Emitidos" value="48" icon={ShoppingCart} color="bg-indigo-600" />
        <StatCard title="Promedio Ticket" value="$259.37" icon={TrendingUp} color="bg-indigo-600" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Ventas Recientes</h3>
          <button className="text-indigo-600 font-bold text-sm hover:underline">Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Folio</th>
                <th className="px-6 py-4 font-bold">Hora</th>
                <th className="px-6 py-4 font-bold">Método</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_SALES.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{sale.id}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      {sale.paymentMethod === 'CASH' ? <Wallet size={16} /> : sale.paymentMethod === 'CARD' ? <CreditCard size={16} /> : <Smartphone size={16} />}
                      <span className="text-sm">{sale.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">Completada</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">${sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SellerInventory = ({ products }: { products: Product[] }) => {
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

// --- Owner Views ---

const OwnerDashboard = ({ products }: { products: Product[] }) => {
  const data = [
    { name: 'Lun', ventas: 4000, utilidad: 2400 },
    { name: 'Mar', ventas: 3000, utilidad: 1398 },
    { name: 'Mie', ventas: 2000, utilidad: 9800 },
    { name: 'Jue', ventas: 2780, utilidad: 3908 },
    { name: 'Vie', ventas: 1890, utilidad: 4800 },
    { name: 'Sab', ventas: 2390, utilidad: 3800 },
    { name: 'Dom', ventas: 3490, utilidad: 4300 },
  ];

  const lowStockCount = products.filter(p => !p.isUnlimited && p.stock <= p.minStock).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Salud del Negocio</h2>
          <p className="text-slate-500">Resumen ejecutivo de tus operaciones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Download size={18} />
          Reporte Mensual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Utilidad Neta" value="$45,200.00" icon={DollarSign} color="bg-indigo-600" trend="up" trendValue="8.4%" />
        <StatCard title="Flujo de Caja" value="$128,450.00" icon={Wallet} color="bg-indigo-600" trend="up" trendValue="12.1%" />
        <StatCard title="Salud Inventario" value={lowStockCount > 0 ? "Atención" : "Óptima"} icon={Package} color={lowStockCount > 0 ? "bg-rose-500" : "bg-indigo-600"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Rendimiento Semanal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="ventas" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Alertas de Inventario</h3>
          <div className="space-y-4">
            {MOCK_PRODUCTS.filter(p => p.stock <= p.minStock).map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    product.stock === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {product.stock === 0 ? <XCircle size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{product.name}</h5>
                    <p className="text-xs text-slate-500">Stock actual: {product.stock} pz</p>
                  </div>
                </div>
                <button className="text-indigo-600 text-xs font-bold hover:underline">Reabastecer</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Super Admin Views ---

const SuperAdminPanel = () => {
  const data = [
    { name: 'Ene', ingresos: 4000 },
    { name: 'Feb', ingresos: 3000 },
    { name: 'Mar', ingresos: 5000 },
    { name: 'Abr', ingresos: 4500 },
    { name: 'May', ingresos: 6000 },
    { name: 'Jun', ingresos: 7500 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel General del Ecosistema</h2>
          <p className="text-slate-500">Consolidado de todas las empresas y suscripciones</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <Globe size={18} />
            Estado Global
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Ingresos Totales" value="$1.2M" icon={DollarSign} color="bg-indigo-600" trend="up" trendValue="15%" />
        <StatCard title="Empresas Activas" value="156" icon={Building2} color="bg-indigo-600" trend="up" trendValue="4%" />
        <StatCard title="Usuarios Totales" value="1,240" icon={Users} color="bg-indigo-600" />
        <StatCard title="Suscripciones" value="142" icon={CheckCircle2} color="bg-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Crecimiento de Ingresos Anual</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="ingresos" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Actividad Reciente</h3>
          <div className="space-y-6">
            {[
              { type: 'new_business', text: 'Nueva empresa: "Café Central"', time: 'Hace 5 min' },
              { type: 'alert', text: 'Alerta de sistema: Backup completado', time: 'Hace 1 hora' },
              { type: 'new_user', text: 'Nuevo dueño registrado: Carlos Ruiz', time: 'Hace 2 horas' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-1 h-10 bg-indigo-100 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{activity.text}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
            Ver todo el log
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Layout ---

const Layout = ({ user, children, onLogout }: { user: User, children: React.ReactNode, onLogout: () => void }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    SELLER: [
      { icon: ShoppingCart, label: 'Ventas', path: '/ventas' },
      { icon: LayoutDashboard, label: 'Resumen', path: '/resumen' },
      { icon: Package, label: 'Inventario', path: '/inventario' },
      { icon: Settings, label: 'Configuración', path: '/configuracion' },
    ],
    OWNER: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: ShoppingCart, label: 'Terminal', path: '/ventas' },
      { icon: BarChart3, label: 'Reportes', path: '/reportes' },
      { icon: Package, label: 'Inventario', path: '/inventario' },
      { icon: Settings, label: 'Configuración', path: '/configuracion' },
    ],
    SUPER_ADMIN: [
      { icon: LayoutDashboard, label: 'Panel General', path: '/panel' },
      { icon: Users, label: 'Dueños', path: '/dueños' },
      { icon: Building2, label: 'Empresas', path: '/empresas' },
      { icon: Settings, label: 'Sistema', path: '/sistema' },
    ]
  };

  const currentMenu = menuItems[user.role];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-slate-100 flex flex-col overflow-hidden whitespace-nowrap"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <ShoppingCart className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-800">ClaudiaPOS</span>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          {currentMenu.map((item) => (
            <SidebarItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              badge={item.label === 'Inventario' ? '3' : undefined}
            />
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {currentMenu.find(m => m.path === location.pathname)?.label || 'Inicio'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-500 text-sm font-medium">
              <Clock size={16} />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500">
              <HelpCircle size={20} />
            </button>
            <div className="w-px h-8 bg-slate-100 mx-2"></div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:border-indigo-200 transition-all">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  const handleLogin = (role: UserRole) => {
    setUser({
      id: '1',
      name: role === 'SUPER_ADMIN' ? 'Admin Sistema' : role === 'OWNER' ? 'Claudia Martínez' : 'Vendedor 1',
      email: role.toLowerCase() + '@claudia.pos',
      role
    });
  };

  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {/* Seller Routes */}
          {user.role === 'SELLER' && (
            <>
              <Route path="/ventas" element={<SellerTerminal products={products} setProducts={setProducts} role={user.role} />} />
              <Route path="/resumen" element={<SellerSummary />} />
              <Route path="/inventario" element={<SellerInventory products={products} />} />
              <Route path="/configuracion" element={<ConfigurationView role={user.role} />} />
              <Route path="*" element={<Navigate to="/ventas" />} />
            </>
          )}

          {/* Owner Routes */}
          {user.role === 'OWNER' && (
            <>
              <Route path="/dashboard" element={<OwnerDashboard products={products} />} />
              <Route path="/ventas" element={<SellerTerminal products={products} setProducts={setProducts} role={user.role} />} />
              <Route path="/reportes" element={<OwnerReports />} />
              <Route path="/inventario" element={<AdminInventory products={products} setProducts={setProducts} />} />
              <Route path="/configuracion" element={<ConfigurationView role={user.role} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}

          {/* Super Admin Routes */}
          {user.role === 'SUPER_ADMIN' && (
            <>
              <Route path="/panel" element={<SuperAdminPanel />} />
              <Route path="/dueños" element={<SuperAdminDueños />} />
              <Route path="/empresas" element={<SuperAdminEmpresas />} />
              <Route path="/sistema" element={<ConfigurationView role={user.role} />} />
              <Route path="*" element={<Navigate to="/panel" />} />
            </>
          )}
        </Routes>
      </Layout>
    </Router>
  );
}
