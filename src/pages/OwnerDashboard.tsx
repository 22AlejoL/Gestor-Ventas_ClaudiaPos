import React from 'react';
import { 
  AreaChart as ReAreaChart, 
  Area as ReArea, 
  XAxis as ReXAxis, 
  YAxis as ReYAxis, 
  CartesianGrid as ReCartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer as ReResponsiveContainer 
} from 'recharts';
import { DollarSign, Wallet, Package, XCircle, AlertCircle, Download } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { Product } from '../types';
import { cn } from '../lib/utils';


interface OwnerDashboardProps {
  products: Product[];
}

const OwnerDashboard = ({ products }: OwnerDashboardProps) => {
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
            <ReResponsiveContainer width="100%" height="100%">
              <ReAreaChart data={data}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <ReXAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <ReYAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <ReTooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <ReArea type="monotone" dataKey="ventas" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </ReAreaChart>
            </ReResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Alertas de Inventario</h3>
          <div className="space-y-4">
            {products.filter(p => !p.isUnlimited && p.stock <= p.minStock).map(product => (
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

export default OwnerDashboard;
