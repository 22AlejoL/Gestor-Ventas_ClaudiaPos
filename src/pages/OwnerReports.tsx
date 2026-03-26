import React from 'react';
import { Download, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { Sale, Business } from '../types';
import SalesHistoryModal from '../components/common/SalesHistoryModal';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface OwnerReportsProps {
  sales: Sale[];
}

const OwnerReports = ({ sales }: OwnerReportsProps) => {
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = React.useState<string>('ALL');

  React.useEffect(() => {
    const fetchOwnerBusinesses = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        const ownerBusinesses = await api.getBusinessesByOwner(session.user.id);
        setBusinesses(ownerBusinesses);
      } catch (error) {
        console.error('Error fetching owner businesses for reports:', error);
      }
    };

    fetchOwnerBusinesses();
  }, []);

  const ownerSales = React.useMemo(() => {
    const businessIds = businesses.map(b => b.id);

    if (businessIds.length === 0) {
      // Keep legacy unassigned sales visible while owner businesses are not linked yet.
      return sales.filter(s => !s.businessId);
    }

    return sales.filter(s => !s.businessId || businessIds.includes(s.businessId));
  }, [sales, businesses]);

  const filteredSales = React.useMemo(() => {
    if (selectedBusiness === 'ALL') return ownerSales;
    return ownerSales.filter(s => s.businessId === selectedBusiness);
  }, [ownerSales, selectedBusiness]);

  const salesByBusiness = React.useMemo(() => {
    if (selectedBusiness !== 'ALL') return [];

    const businessMap = new Map<string, { name: string; total: number; salesCount: number }>();
    businesses.forEach(b => {
      businessMap.set(b.id, { name: b.name, total: 0, salesCount: 0 });
    });

    filteredSales.forEach(sale => {
      const key = sale.businessId || 'unassigned';
      if (!businessMap.has(key)) {
        businessMap.set(key, { name: 'Sin asignar', total: 0, salesCount: 0 });
      }

      const current = businessMap.get(key)!;
      current.total += sale.total;
      current.salesCount += 1;
      businessMap.set(key, current);
    });

    return Array.from(businessMap.values())
      .filter(entry => entry.total > 0 || entry.salesCount > 0)
      .sort((a, b) => b.total - a.total);
  }, [filteredSales, businesses, selectedBusiness]);

  // Dynamic calculations based on real sales data
  const { data, pieData, metrics } = React.useMemo(() => {
    // 1. Calculate Monthly Cash Flow (Flujo de Caja Mensual) - Last 6 months
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { 
        name: d.toLocaleString('es-ES', { month: 'short' }).replace(/^\w/, c => c.toUpperCase()), 
        month: d.getMonth(), 
        year: d.getFullYear(),
        ventas: 0,
        meta: 0
      };
    });

    // 2. Setup Payment Methods mapping
    const methodsMap: Record<string, { value: number, color: string }> = {
      'CASH': { value: 0, color: '#4f46e5' },
      'CARD': { value: 0, color: '#818cf8' },
      'DIGITAL': { value: 0, color: '#c7d2fe' }
    };

    let totalRevenue = 0;
    let totalItems = 0;

    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const saleMonth = saleDate.getMonth();
      const saleYear = saleDate.getFullYear();

      // Flujo de Caja
      const monthObj = last6Months.find(m => m.month === saleMonth && m.year === saleYear);
      if (monthObj) {
        monthObj.ventas += sale.total;
      }

      // Metodos de pago
      if (methodsMap[sale.paymentMethod]) {
        methodsMap[sale.paymentMethod].value += sale.total;
      }

      // Metrics
      totalRevenue += sale.total;
      sale.items?.forEach(item => {
        totalItems += item.quantity;
      });
    });

    // Añadir una línea de "meta" dinámica (e.j., 20% más que las ventas o mínimo 1000)
    last6Months.forEach(m => m.meta = Math.max(1000, m.ventas * 1.2));

    const pieFormatted = [
      { name: 'Efectivo', value: methodsMap.CASH.value || 1, color: methodsMap.CASH.color }, // fallback to 1 so pie chart draws something if empty
      { name: 'Tarjeta', value: methodsMap.CARD.value || 1, color: methodsMap.CARD.color },
      { name: 'Digital', value: methodsMap.DIGITAL.value || 1, color: methodsMap.DIGITAL.color }
    ];

    const totalPie = pieFormatted.reduce((acc, curr) => acc + curr.value, 0);

    return {
      data: last6Months,
      pieData: pieFormatted,
      metrics: {
        totalRevenue,
        totalSales: filteredSales.length,
        avgTicket: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0,
        totalItems,
        totalPie
      }
    };
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reportes de Rendimiento</h2>
          <p className="text-slate-500">Análisis detallado de ventas y rentabilidad basado en registros reales</p>
        </div>
        <div className="flex gap-3">
          {businesses.length > 1 && (
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las empresas</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Últimos 6 meses</option>
            <option>Este año</option>
            <option>Personalizado</option>
          </select>
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <History size={18} />
            Historial de Ventas
          </button>
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
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]}
                />
                <Line type="monotone" dataKey="ventas" name="Ventas Reales" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="meta" name="Meta (Ref)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Ingresos por Método de Pago</h3>
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
                <Tooltip formatter={(value: number) => [`$${(value === 1 && metrics.totalRevenue === 0 ? 0 : value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`]} />
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
                <span className="text-sm font-bold text-slate-800">
                  {metrics.totalRevenue === 0 ? '0.0' : ((item.value / metrics.totalPie) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Ingresos Totales (Real)</p>
          <h4 className="text-2xl font-bold text-slate-800">${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          <div className="mt-2 text-slate-500 text-xs font-bold">
            Acumulado histórico
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Ventas Completadas</p>
          <h4 className="text-2xl font-bold text-slate-800">{metrics.totalSales}</h4>
          <div className="mt-2 text-slate-500 text-xs font-bold">
            Transacciones procesadas
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Ticket Promedio</p>
          <h4 className="text-2xl font-bold text-slate-800">${metrics.avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          <div className="mt-2 text-slate-500 text-xs font-bold">
            Gasto por cliente
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Artículos Vendidos</p>
          <h4 className="text-2xl font-bold text-slate-800">{metrics.totalItems}</h4>
          <div className="mt-2 text-slate-500 text-xs font-bold">
            Unidades desplazadas
          </div>
        </div>
      </div>

      {salesByBusiness.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Ventas por Empresa</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              {salesByBusiness.length} empresas
            </span>
          </div>
          <div className="space-y-3">
            {salesByBusiness.map((business) => (
              <div key={business.name} className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
                <div>
                  <p className="font-bold text-slate-800">{business.name}</p>
                  <p className="text-xs text-slate-500">{business.salesCount} ventas</p>
                </div>
                <p className="font-bold text-slate-800">
                  ${business.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showHistoryModal && (
        <SalesHistoryModal 
          sales={filteredSales} 
          role="OWNER" 
          onClose={() => setShowHistoryModal(false)} 
        />
      )}
    </div>
  );
};

export default OwnerReports;
