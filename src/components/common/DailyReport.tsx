import React, { useState, useMemo } from 'react';
import { Business, Sale, UserRole } from '../../types';
import DatePicker from './DatePicker';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Wallet, 
  CreditCard, 
  Smartphone,
  Smartphone as DigitalIcon,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DailyReportProps {
  sales: Sale[];
  role: UserRole;
  currentSellerId?: string;
  businesses?: Business[];
}

const DailyReport: React.FC<DailyReportProps> = ({ 
  sales, 
  role, 
  currentSellerId,
  businesses = [] 
}) => {
  // Estado para la fecha seleccionada (por defecto hoy)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Helper para comparar si dos fechas son el mismo día
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Helper para obtener fecha de ayer
  const getYesterday = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  // Helper para obtener fecha de mañana
  const getTomorrow = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Formatear fecha para mostrar
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Agregar hora para evitar problemas de timezone
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'Hoy';
    if (isSameDay(date, yesterday)) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).replace(/^\w/, c => c.toUpperCase());
  };

  // Ventas del día seleccionado
  const dailySales = useMemo(() => {
    const targetDate = new Date(selectedDate + 'T00:00:00');
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isSameDay(saleDate, targetDate);
    });
  }, [sales, selectedDate]);

  // Ventas del día anterior (para comparación)
  const yesterdaySales = useMemo(() => {
    const yesterdayDate = new Date(getYesterday(selectedDate) + 'T00:00:00');
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isSameDay(saleDate, yesterdayDate);
    });
  }, [sales, selectedDate]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    const totalRevenue = dailySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = dailySales.length;
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalItems = dailySales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Métricas del día anterior para comparación
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
    const revenueChange = yesterdayRevenue > 0 
      ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalSales,
      avgTicket,
      totalItems,
      revenueChange,
      yesterdayRevenue
    };
  }, [dailySales, yesterdaySales]);

  // Datos para gráfico de métodos de pago
  const paymentMethodData = useMemo(() => {
    const methods = {
      'CASH': { name: 'Efectivo', value: 0, color: '#4f46e5', icon: Wallet },
      'CARD': { name: 'Tarjeta', value: 0, color: '#818cf8', icon: CreditCard },
      'DIGITAL': { name: 'Digital', value: 0, color: '#c7d2fe', icon: DigitalIcon }
    };

    dailySales.forEach(sale => {
      if (methods[sale.paymentMethod]) {
        methods[sale.paymentMethod].value += sale.total;
      }
    });

    return Object.values(methods).filter(m => m.value > 0);
  }, [dailySales]);

  // Datos para gráfico de ventas por hora
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      ventas: 0
    }));

    dailySales.forEach(sale => {
      const hour = new Date(sale.date).getHours();
      hours[hour].ventas += sale.total;
    });

    // Filtrar solo horas con ventas para el gráfico
    return hours.filter(h => h.ventas > 0);
  }, [dailySales]);

  // Navegación de fechas
  const goToPreviousDay = () => {
    setSelectedDate(getYesterday(selectedDate));
  };

  const goToNextDay = () => {
    const tomorrow = getTomorrow(selectedDate);
    const today = new Date().toISOString().split('T')[0];
    if (tomorrow <= today) {
      setSelectedDate(tomorrow);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Mapeo de nombres de empresas
  const businessNameById = businesses.reduce((acc, business) => {
    acc[business.id] = business.name;
    return acc;
  }, {} as Record<string, string>);

  // Helper para obtener total de items de una venta
  const getTotalSoldUnits = (sale: Sale) => {
    return sale.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  };

  // Helper para obtener método de pago con ícono
  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'CASH':
        return { icon: Wallet, label: 'Efectivo', color: 'text-emerald-600' };
      case 'CARD':
        return { icon: CreditCard, label: 'Tarjeta', color: 'text-blue-600' };
      case 'DIGITAL':
        return { icon: Smartphone, label: 'Digital', color: 'text-purple-600' };
      default:
        return { icon: Wallet, label: method, color: 'text-slate-600' };
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header con selector de fecha */}
      <div className="surface-panel p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600 flex-shrink-0" />
              <span className="truncate">Reporte Diario</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1 truncate">
              {formatDateDisplay(selectedDate)}
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* Navegación de fechas */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 flex-shrink-0">
              <button
                onClick={goToPreviousDay}
                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                title="Día anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToToday}
                disabled={isToday}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isToday 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'hover:bg-white text-slate-600'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={goToNextDay}
                disabled={isToday}
                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Día siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Selector de fecha */}
            <div className="w-full sm:w-40 md:w-48 flex-shrink-0">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Seleccionar fecha"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Ingresos */}
        <div className="surface-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              {metrics.revenueChange !== 0 && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  metrics.revenueChange > 0 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-rose-50 text-rose-600'
                }`}>
                  {metrics.revenueChange > 0 ? '+' : ''}{metrics.revenueChange.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Total Ingresos</p>
            <h4 className="text-2xl font-bold text-slate-800">
              ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="text-xs text-slate-400 mt-2">
              {isToday ? 'vs ayer' : 'vs día anterior'}
            </p>
          </div>
        </div>

        {/* Número de Ventas */}
        <div className="surface-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShoppingCart size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Ventas Realizadas</p>
            <h4 className="text-2xl font-bold text-slate-800">{metrics.totalSales}</h4>
            <p className="text-xs text-slate-400 mt-2">
              transacciones
            </p>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="surface-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Ticket Promedio</p>
            <h4 className="text-2xl font-bold text-slate-800">
              ${metrics.avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="text-xs text-slate-400 mt-2">
              por transacción
            </p>
          </div>
        </div>

        {/* Artículos Vendidos */}
        <div className="surface-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Package size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Artículos Vendidos</p>
            <h4 className="text-2xl font-bold text-slate-800">{metrics.totalItems}</h4>
            <p className="text-xs text-slate-400 mt-2">
              unidades
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métodos de Pago */}
        <div className="surface-panel p-6">
          <h3 className="font-bold text-slate-800 mb-6">Ingresos por Método de Pago</h3>
          {paymentMethodData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p className="text-sm">No hay ventas registradas</p>
            </div>
          )}
          <div className="space-y-3 mt-4">
            {paymentMethodData.map(item => {
              const Icon = item.icon;
              const percentage = metrics.totalRevenue > 0 
                ? (item.value / metrics.totalRevenue) * 100 
                : 0;
              return (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                      <Icon size={16} style={{ color: item.color }} />
                    </div>
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800 block">
                      ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-400">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ventas por Hora */}
        <div className="surface-panel p-6">
          <h3 className="font-bold text-slate-800 mb-6">Ventas por Hora</h3>
          {hourlyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="ventas" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p className="text-sm">No hay ventas registradas</p>
            </div>
          )}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Distribución de ventas durante el día
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Transacciones */}
      <div className="surface-panel overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">
            Transacciones del Día 
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({dailySales.length} {dailySales.length === 1 ? 'venta' : 'ventas'})
            </span>
          </h3>
        </div>
        
        {dailySales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">Hora</th>
                  <th className="table-head-cell">Folio</th>
                  {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                    <th className="table-head-cell">Empresa</th>
                  )}
                  {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                    <th className="table-head-cell">Vendedor</th>
                  )}
                  <th className="table-head-cell">Método</th>
                  <th className="table-head-cell">Artículos</th>
                  <th className="table-head-cell text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailySales
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(sale => {
                    const paymentMethod = getPaymentMethodDisplay(sale.paymentMethod);
                    const PaymentIcon = paymentMethod.icon;
                    
                    return (
                      <tr key={sale.id} className="table-row">
                        <td className="table-cell">
                          <span className="text-sm font-medium text-slate-700">
                            {new Date(sale.date).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="font-bold text-slate-800">{sale.id}</span>
                        </td>
                        {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                          <td className="table-cell">
                            <span className="text-xs font-medium text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md bg-white">
                              {sale.businessId 
                                ? (businessNameById[sale.businessId] || 'Empresa no disponible') 
                                : 'Sin empresa'}
                            </span>
                          </td>
                        )}
                        {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                          <td className="table-cell">
                            <span className="text-sm font-medium text-slate-600">
                              {sale.sellerName || 'Sin nombre'}
                            </span>
                          </td>
                        )}
                        <td className="table-cell">
                          <div className={`flex items-center gap-2 ${paymentMethod.color}`}>
                            <PaymentIcon size={16} />
                            <span className="text-sm">{paymentMethod.label}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="relative group inline-block">
                            <span className="text-sm text-slate-600 border-b border-dashed border-slate-300 cursor-help">
                              {getTotalSoldUnits(sale)} items
                            </span>
                            
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 max-w-[calc(100vw-5rem)] bg-slate-900 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-slate-700 pointer-events-none">
                              <p className="font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1">
                                Detalle de la venta
                              </p>
                              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                {sale.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-start justify-between gap-3">
                                    <span className="font-bold text-indigo-300 whitespace-nowrap">{item.quantity}x</span>
                                    <span className="text-right font-medium whitespace-normal break-words text-slate-100">
                                      {item.productName || 'Producto'}
                                    </span>
                                    <span className="text-slate-400">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between">
                                <span className="text-slate-400">Total:</span>
                                <span className="font-bold text-white">${sale.total.toFixed(2)}</span>
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-slate-900"></div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-right font-bold text-slate-800">
                          ${sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-slate-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-700 mb-1">
              Sin ventas registradas
            </h4>
            <p className="text-sm text-slate-500">
              No se encontraron ventas para el día {formatDateDisplay(selectedDate)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReport;
