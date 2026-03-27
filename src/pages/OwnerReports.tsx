import React from 'react';
import { Download, ArrowUpRight, ArrowDownRight, History, CalendarDays } from 'lucide-react';
import { Business, Sale } from '../types';
import SalesHistoryModal from '../components/common/SalesHistoryModal';
import BusinessScopePicker from '../components/common/BusinessScopePicker';
import StyledDropdown from '../components/common/StyledDropdown';
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
  businesses: Business[];
  selectedBusiness: string;
  onSelectBusiness: (businessId: string) => void;
}

const OwnerReports = ({ sales, businesses, selectedBusiness, onSelectBusiness }: OwnerReportsProps) => {
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [reportRange, setReportRange] = React.useState('LAST_6_MONTHS');

  const reportRangeLabelMap: Record<string, string> = {
    LAST_6_MONTHS: 'Ultimos 6 meses',
    LAST_12_MONTHS: 'Ultimos 12 meses',
    THIS_YEAR: 'Este ano',
    ALL_TIME: 'Historico completo'
  };

  const salesByBusiness = React.useMemo(() => {
    if (selectedBusiness === 'ALL') return sales;
    return sales.filter((sale) => sale.businessId === selectedBusiness);
  }, [sales, selectedBusiness]);

  const visibleSales = React.useMemo(() => {
    const now = new Date();

    const startOfRange = new Date(now);
    if (reportRange === 'LAST_6_MONTHS') {
      startOfRange.setMonth(startOfRange.getMonth() - 5);
      startOfRange.setDate(1);
    }
    if (reportRange === 'LAST_12_MONTHS') {
      startOfRange.setMonth(startOfRange.getMonth() - 11);
      startOfRange.setDate(1);
    }

    return salesByBusiness.filter((sale) => {
      const saleDate = new Date(sale.date);
      if (reportRange === 'THIS_YEAR') {
        return saleDate.getFullYear() === now.getFullYear();
      }
      if (reportRange === 'ALL_TIME') {
        return true;
      }
      return saleDate >= startOfRange;
    });
  }, [salesByBusiness, reportRange]);

  // Dynamic calculations based on real sales data
  const { data, pieData, metrics } = React.useMemo(() => {
    // 1. Calculate Monthly Cash Flow based on selected range
    const monthWindow = reportRange === 'THIS_YEAR'
      ? new Date().getMonth() + 1
      : reportRange === 'LAST_12_MONTHS' || reportRange === 'ALL_TIME'
        ? 12
        : 6;

    const cashFlowMonths = Array.from({ length: monthWindow }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (monthWindow - 1 - i));
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

    visibleSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const saleMonth = saleDate.getMonth();
      const saleYear = saleDate.getFullYear();

      // Flujo de Caja
      const monthObj = cashFlowMonths.find(m => m.month === saleMonth && m.year === saleYear);
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
    cashFlowMonths.forEach(m => m.meta = Math.max(1000, m.ventas * 1.2));

    const pieFormatted = [
      { name: 'Efectivo', value: methodsMap.CASH.value || 1, color: methodsMap.CASH.color }, // fallback to 1 so pie chart draws something if empty
      { name: 'Tarjeta', value: methodsMap.CARD.value || 1, color: methodsMap.CARD.color },
      { name: 'Digital', value: methodsMap.DIGITAL.value || 1, color: methodsMap.DIGITAL.color }
    ];

    const totalPie = pieFormatted.reduce((acc, curr) => acc + curr.value, 0);

    return {
      data: cashFlowMonths,
      pieData: pieFormatted,
      metrics: {
        totalRevenue,
        totalSales: visibleSales.length,
        avgTicket: visibleSales.length > 0 ? totalRevenue / visibleSales.length : 0,
        totalItems,
        totalPie
      }
    };
  }, [visibleSales, reportRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
        <div className="xl:min-h-[166px] flex flex-col justify-center">
          <h2 className="section-title">Reportes de Rendimiento</h2>
          <p className="section-subtitle">Análisis detallado de ventas y rentabilidad basado en registros reales</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap justify-start xl:justify-end">
          <div className="w-full md:w-auto min-w-[320px]">
            <BusinessScopePicker
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={onSelectBusiness}
              title="Vista de empresas"
              allLabel="Consolidado Global"
              className="h-[166px]"
            />
          </div>
          <div className="surface-card p-4 min-w-[320px] h-[166px]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Periodo del reporte</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarDays size={18} />
              </div>
            </div>
            <div>
              <StyledDropdown
                value={reportRange}
                onChange={setReportRange}
                options={[
                  { value: 'LAST_6_MONTHS', label: 'Últimos 6 meses' },
                  { value: 'LAST_12_MONTHS', label: 'Últimos 12 meses' },
                  { value: 'THIS_YEAR', label: 'Este año' },
                  { value: 'ALL_TIME', label: 'Histórico completo' }
                ]}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">Seleccionado: {reportRangeLabelMap[reportRange] || 'Personalizado'}</p>
          </div>
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="btn-secondary h-[46px]"
          >
            <History size={18} />
            Historial de Ventas
          </button>
          <button className="btn-primary h-[46px]">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 surface-panel p-6">
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

        <div className="surface-panel p-6">
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
        <div className="surface-panel p-6">
          <p className="text-slate-500 text-sm mb-1">Ingresos Totales (Real)</p>
          <h4 className="text-2xl font-bold text-slate-800">${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          <div className="mt-2 text-slate-500 text-xs font-bold">
            Acumulado histórico
          </div>
        </div>
        <div className="surface-panel p-6">
          <p className="text-slate-500 text-sm mb-1">Ventas Completadas</p>
          <h4 className="text-2xl font-bold text-slate-800">{metrics.totalSales}</h4>
          <div className="mt-2 text-slate-500 text-xs font-bold">
            Transacciones procesadas
          </div>
        </div>
        <div className="surface-panel p-6">
          <p className="text-slate-500 text-sm mb-1">Ticket Promedio</p>
          <h4 className="text-2xl font-bold text-slate-800">${metrics.avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          <div className="mt-2 text-slate-500 text-xs font-bold">
            Gasto por cliente
          </div>
        </div>
        <div className="surface-panel p-6">
          <p className="text-slate-500 text-sm mb-1">Artículos Vendidos</p>
          <h4 className="text-2xl font-bold text-slate-800">{metrics.totalItems}</h4>
          <div className="mt-2 text-slate-500 text-xs font-bold">
            Unidades desplazadas
          </div>
        </div>
      </div>

      {showHistoryModal && (
        <SalesHistoryModal 
          sales={visibleSales} 
          role="OWNER" 
          businesses={businesses}
          onClose={() => setShowHistoryModal(false)} 
        />
      )}
    </div>
  );
};

export default OwnerReports;
