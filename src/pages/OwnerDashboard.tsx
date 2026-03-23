import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart as ReAreaChart, 
  Area as ReArea, 
  XAxis as ReXAxis, 
  YAxis as ReYAxis, 
  CartesianGrid as ReCartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer as ReResponsiveContainer 
} from 'recharts';
import { DollarSign, Wallet, Package, XCircle, AlertCircle, Download, Building2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { Product, Sale, Business } from '../types';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface OwnerDashboardProps {
  products: Product[];
  sales: Sale[];
}

const OwnerDashboard = ({ products, sales }: OwnerDashboardProps) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session.user.id);
        
      if (data) {
        setBusinesses(data.map(d => ({
          id: d.id,
          name: d.name,
          ownerId: d.owner_id,
          status: d.status
        })));
      }
      setLoading(false);
    };

    fetchCompanies();
  }, []);

  // Filter products and sales based on selected business
  const filteredProducts = useMemo(() => {
    const validBusinessIds = businesses.map(b => b.id);
    if (selectedBusiness === 'ALL') {
      return products.filter(p => !p.businessId || validBusinessIds.includes(p.businessId));
    }
    return products.filter(p => p.businessId === selectedBusiness);
  }, [products, selectedBusiness, businesses]);

  const filteredSales = useMemo(() => {
    const validBusinessIds = businesses.map(b => b.id);
    if (selectedBusiness === 'ALL') {
      return sales.filter(s => !s.businessId || validBusinessIds.includes(s.businessId));
    }
    return sales.filter(s => s.businessId === selectedBusiness);
  }, [sales, selectedBusiness, businesses]);

  // Calculations
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let netProfit = 0;

    filteredSales.forEach(sale => {
      totalRevenue += sale.total;
      
      // Calculate profit: revenue - (cost * quantity)
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const cost = product ? product.cost : 0;
        netProfit += (item.price - cost) * item.quantity;
      });
    });

    const lowStockProducts = filteredProducts.filter(p => !p.isUnlimited && p.stock <= p.minStock);

    return { totalRevenue, netProfit, lowStockProducts };
  }, [filteredSales, filteredProducts, products]);

  // Chart Data: Group sales by day of week
  const chartData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const dataMap = new Map();
    days.forEach(d => dataMap.set(d, { name: d, ventas: 0 }));

    filteredSales.forEach(sale => {
      const date = new Date(sale.date);
      const dayName = days[date.getDay()];
      const current = dataMap.get(dayName);
      current.ventas += sale.total;
    });

    // Reorder starting from Monday
    return [
      dataMap.get('Lun'), dataMap.get('Mar'), dataMap.get('Mie'),
      dataMap.get('Jue'), dataMap.get('Vie'), dataMap.get('Sab'), dataMap.get('Dom')
    ];
  }, [filteredSales]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
         <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard de Propietario</h2>
          <p className="text-slate-500">Resumen y analíticas de tus operaciones</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Building2 size={18} className="text-slate-400" />
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Consolidado Global (Todas)</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap">
            <Download size={18} />
            <span className="hidden md:inline">Reporte Mensual</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Utilidad Neta Calculada" 
          value={`$${metrics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Flujo de Caja (Bruto)" 
          value={`$${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
          icon={Wallet} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Salud Inventario" 
          value={metrics.lowStockProducts.length > 0 ? "Requiere Atención" : "Óptima"} 
          icon={Package} 
          color={metrics.lowStockProducts.length > 0 ? "bg-rose-500" : "bg-indigo-600"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Ingresos Brutos por Día</h3>
          <div className="h-80">
            <ReResponsiveContainer width="100%" height="100%">
              <ReAreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <ReXAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <ReYAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
                <ReTooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                />
                <ReArea type="monotone" dataKey="ventas" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </ReAreaChart>
            </ReResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Alertas de Inventario</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              {metrics.lowStockProducts.length} productos
            </span>
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {metrics.lowStockProducts.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl">
                <Package className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 font-medium text-sm">Todo el inventario está en niveles saludables.</p>
              </div>
            ) : (
              metrics.lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      product.stock === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {product.stock === 0 ? <XCircle size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{product.name}</h5>
                      <p className="text-xs text-slate-500">Stock actual: {product.stock} pz</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 mb-1">Mínimo: {product.minStock}</span>
                    <button className="text-indigo-600 text-xs font-bold hover:underline">Reabastecer</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
