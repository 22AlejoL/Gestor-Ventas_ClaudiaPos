import React from 'react';
import { Download, ArrowUpRight, ArrowDownRight, History, CalendarDays, BarChart3 } from 'lucide-react';
import { Business, Sale } from '../types';
import SalesHistoryModal from '../components/common/SalesHistoryModal';
import BusinessScopePicker from '../components/common/BusinessScopePicker';
import StyledDropdown from '../components/common/StyledDropdown';
import { 
  getBogotaDate,
  getRelativeDateBogota,
  formatBogotaDate,
  getShortMonthBogota
} from '../lib/date-utils';
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
  const [reportRange, setReportRange] = React.useState('LAST_30_DAYS');

  const reportRangeLabelMap: Record<string, string> = {
    LAST_7_DAYS: 'Últimos 7 días',
    LAST_14_DAYS: 'Últimos 14 días',
    LAST_30_DAYS: 'Últimos 30 días',
    LAST_6_MONTHS: 'Últimos 6 meses',
    LAST_12_MONTHS: 'Últimos 12 meses',
    THIS_YEAR: 'Este año',
    ALL_TIME: 'Histórico completo'
  };

  const salesByBusiness = React.useMemo(() => {
    if (selectedBusiness === 'ALL') return sales;
    return sales.filter((sale) => sale.businessId === selectedBusiness);
  }, [sales, selectedBusiness]);

  const visibleSales = React.useMemo(() => {
    const now = getBogotaDate();

    return salesByBusiness.filter((sale) => {
      const saleDate = new Date(sale.date);
      
      if (reportRange === 'LAST_7_DAYS') {
        const startDate = getRelativeDateBogota(-7);
        return saleDate >= startDate;
      }
      if (reportRange === 'LAST_14_DAYS') {
        const startDate = getRelativeDateBogota(-14);
        return saleDate >= startDate;
      }
      if (reportRange === 'LAST_30_DAYS') {
        const startDate = getRelativeDateBogota(-30);
        return saleDate >= startDate;
      }
      if (reportRange === 'LAST_6_MONTHS') {
        const startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 5);
        startDate.setDate(1);
        return saleDate >= startDate;
      }
      if (reportRange === 'LAST_12_MONTHS') {
        const startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 11);
        startDate.setDate(1);
        return saleDate >= startDate;
      }
      if (reportRange === 'THIS_YEAR') {
        return saleDate.getFullYear() === now.getFullYear();
      }
      if (reportRange === 'ALL_TIME') {
        return true;
      }
      return true;
    });
  }, [salesByBusiness, reportRange]);

  // Dynamic calculations based on real sales data
  const { data, pieData, metrics } = React.useMemo(() => {
    // Setup Payment Methods mapping
    const methodsMap: Record<string, { value: number, color: string }> = {
      'CASH': { value: 0, color: '#4f46e5' },
      'CARD': { value: 0, color: '#818cf8' },
      'DIGITAL': { value: 0, color: '#c7d2fe' }
    };

    let totalRevenue = 0;
    let totalItems = 0;

    // Para rangos de días, agrupar por día; para meses, agrupar por mes
    const isDayRange = reportRange === 'LAST_7_DAYS' || reportRange === 'LAST_14_DAYS' || reportRange === 'LAST_30_DAYS';
    
    let timeSeriesData: any[] = [];

    if (isDayRange) {
      // Calcular número de días basado en el rango
      let days = 30;
      if (reportRange === 'LAST_7_DAYS') days = 7;
      if (reportRange === 'LAST_14_DAYS') days = 14;
      if (reportRange === 'LAST_30_DAYS') days = 30;

      // Generar datos para cada día
      timeSeriesData = Array.from({ length: days }).map((_, i) => {
        const date = getRelativeDateBogota(-(days - 1 - i));
        return {
          name: getShortMonthBogota(date) + ' ' + date.getDate(),
          fullDate: formatBogotaDate(date, { weekday: 'long', day: 'numeric', month: 'long' }),
          date: date,
          ventas: 0,
          meta: 0
        };
      });

      // Agregar ventas a los días correspondientes
      visibleSales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const dayObj = timeSeriesData.find(d => isSameDayBogota(d.date, saleDate));
        if (dayObj) {
          dayObj.ventas += sale.total;
        }

        if (methodsMap[sale.paymentMethod]) {
          methodsMap[sale.paymentMethod].value += sale.total;
        }

        totalRevenue += sale.total;
        sale.items?.forEach(item => {
          totalItems += item.quantity;
        });
      });
    } else {
      // Para rangos de meses, mantener el comportamiento original
      const monthWindow = reportRange === 'THIS_YEAR'
        ? getBogotaDate().getMonth() + 1
        : reportRange === 'LAST_12_MONTHS' || reportRange === 'ALL_TIME'
          ? 12
          : 6;

      timeSeriesData = Array.from({ length: monthWindow }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (monthWindow - 1 - i));
        return { 
          name: d.toLocaleString('es-ES', { month: 'short', timeZone: 'America/Bogota' }).replace(/^\w/, c => c.toUpperCase()), 
          fullDate: d.toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'America/Bogota' }),
          month: d.getMonth(), 
          year: d.getFullYear(),
          ventas: 0,
          meta: 0
        };
      });

      visibleSales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const saleMonth = saleDate.getMonth();
        const saleYear = saleDate.getFullYear();

        const monthObj = timeSeriesData.find(m => m.month === saleMonth && m.year === saleYear);
        if (monthObj) {
          monthObj.ventas += sale.total;
        }

        if (methodsMap[sale.paymentMethod]) {
          methodsMap[sale.paymentMethod].value += sale.total;
        }

        totalRevenue += sale.total;
        sale.items?.forEach(item => {
          totalItems += item.quantity;
        });
      });
    }

    // Añadir línea de meta dinámica
    timeSeriesData.forEach((m: any) => m.meta = Math.max(1000, m.ventas * 1.2));

    const pieFormatted = [
      { name: 'Efectivo', value: methodsMap.CASH.value || 1, color: methodsMap.CASH.color },
      { name: 'Tarjeta', value: methodsMap.CARD.value || 1, color: methodsMap.CARD.color },
      { name: 'Digital', value: methodsMap.DIGITAL.value || 1, color: methodsMap.DIGITAL.color }
    ];

    const totalPie = pieFormatted.reduce((acc, curr) => acc + curr.value, 0);

    return {
      data: timeSeriesData,
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

  // Helper para comparar días en Bogotá
  const isSameDayBogota = (date1: Date, date2: Date): boolean => {
    const bogota1 = date1.toLocaleDateString('en-US', { timeZone: 'America/Bogota' });
    const bogota2 = date2.toLocaleDateString('en-US', { timeZone: 'America/Bogota' });
    return bogota1 === bogota2;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4">
        <div className="flex-shrink-0">
          <h2 className="section-title">Reportes de Rendimiento</h2>
          <p className="section-subtitle">Análisis detallado de ventas y rentabilidad basado en registros reales</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-start">
          <div className="w-full lg:w-auto min-w-[280px] lg:min-w-[320px]">
            <BusinessScopePicker
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={onSelectBusiness}
              title="Vista de empresas"
              allLabel="Consolidado Global"
              className="h-auto lg:h-[166px]"
            />
          </div>
          <div className="surface-card p-4 min-w-[280px] lg:min-w-[320px]">
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
                  { value: 'LAST_7_DAYS', label: 'Últimos 7 días' },
                  { value: 'LAST_14_DAYS', label: 'Últimos 14 días' },
                  { value: 'LAST_30_DAYS', label: 'Últimos 30 días' },
                  { value: 'LAST_6_MONTHS', label: 'Últimos 6 meses' },
                  { value: 'LAST_12_MONTHS', label: 'Últimos 12 meses' },
                  { value: 'THIS_YEAR', label: 'Este año' },
                  { value: 'ALL_TIME', label: 'Histórico completo' }
                ]}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">Seleccionado: {reportRangeLabelMap[reportRange] || 'Personalizado'}</p>
          </div>
          <div className="flex flex-row gap-3">
            <button 
              onClick={() => setShowHistoryModal(true)}
              className="btn-secondary h-[46px] whitespace-nowrap"
            >
              <History size={18} />
              Historial de Ventas
            </button>
            <button className="btn-primary h-[46px] whitespace-nowrap">
              <Download size={18} />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 surface-panel p-6">
          <h3 className="font-bold text-slate-800 mb-6">
            {reportRange === 'LAST_7_DAYS' || reportRange === 'LAST_14_DAYS' || reportRange === 'LAST_30_DAYS' 
              ? 'Flujo de Caja Diario' 
              : 'Flujo de Caja Mensual'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
                  }}
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
