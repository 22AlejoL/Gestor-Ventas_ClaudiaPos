import React, { useMemo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Printer, UserCheck, Wallet, CreditCard, Smartphone, History, LayoutDashboard, ChevronRight } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { Sale, UserRole } from '../types';
import SalesHistoryModal from '../components/common/SalesHistoryModal';
import { cn } from '../lib/utils';
import {
  getBogotaDate,
  formatBogotaDate,
  isSameDayBogota,
  getRelativeDateBogota
} from '../lib/date-utils';

interface SellerSummaryProps {
  sales: Sale[];
  role: UserRole;
  sellerId: string;
}

const SellerSummary = ({ sales, role, sellerId }: SellerSummaryProps) => {
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [expandedDays, setExpandedDays] = React.useState<string[]>([getBogotaDate().toISOString().split('T')[0]]);

  // Get current date formatted in Bogota timezone
  const currentDate = getBogotaDate();
  const formattedDate = formatBogotaDate(currentDate, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate metrics
  const totalVentas = sales.reduce((acc, s) => acc + s.total, 0);
  const ticketPromedio = sales.length > 0 ? totalVentas / sales.length : 0;

  // Group sales by day
  const salesByDay = useMemo(() => {
    const grouped = new Map<string, Sale[]>();
    
    sales.forEach(sale => {
      const dateKey = sale.date.split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(sale);
    });

    // Sort by date descending
    return Array.from(grouped.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, daySales]) => ({
        date,
        dateLabel: formatDateLabel(date),
        sales: daySales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        total: daySales.reduce((sum, s) => sum + s.total, 0),
        count: daySales.length,
        paymentBreakdown: daySales.reduce((acc, s) => {
          acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
          return acc;
        }, {} as Record<string, number>)
      }));
  }, [sales]);

  // Today's sales using Bogota timezone
  const todayKey = getBogotaDate().toISOString().split('T')[0];
  const todayStats = salesByDay.find(d => d.date === todayKey) || { total: 0, count: 0, sales: [] };

  // Yesterday's sales for comparison using Bogota timezone
  const yesterday = getRelativeDateBogota(-1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];
  const yesterdayStats = salesByDay.find(d => d.date === yesterdayKey) || { total: 0, count: 0 };

  const toggleDay = (date: string) => {
    setExpandedDays(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00-05:00'); // Interpretar como hora de Bogotá
    const today = getBogotaDate();
    const yesterday = getRelativeDateBogota(-1);

    if (isSameDayBogota(date, today)) return 'Hoy';
    if (isSameDayBogota(date, yesterday)) return 'Ayer';
    
    return formatBogotaDate(date, {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="section-title">Resumen de mi Turno</h2>
          <p className="section-subtitle capitalize">{formattedDate}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <Printer size={18} />
            Imprimir Corte
          </button>
          <button className="btn-primary">
            <UserCheck size={18} />
            Asistencia
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
        <h3 className="text-sm font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <ShoppingCart size={16} />
          Ventas de Hoy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-1">Ventas Hoy</p>
            <p className="text-2xl font-bold text-slate-800">
              ${todayStats.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            {yesterdayStats.total > 0 && (
              <p className={`text-xs mt-1 ${todayStats.total >= yesterdayStats.total ? 'text-emerald-600' : 'text-rose-600'}`}>
                {todayStats.total >= yesterdayStats.total ? '↑' : '↓'} vs ayer (${yesterdayStats.total.toFixed(2)})
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-1">Tickets Hoy</p>
            <p className="text-2xl font-bold text-slate-800">{todayStats.count}</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-1">Ticket Promedio</p>
            <p className="text-2xl font-bold text-slate-800">
              ${todayStats.count > 0 ? (todayStats.total / todayStats.count).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ventas Totales (Histórico)" value={`$${totalVentas.toLocaleString()}`} icon={DollarSign} color="bg-indigo-600" />
        <StatCard title="Tickets Emitidos" value={sales.length.toString()} icon={ShoppingCart} color="bg-indigo-600" />
        <StatCard title="Promedio Ticket" value={`$${ticketPromedio.toFixed(2)}`} icon={TrendingUp} color="bg-indigo-600" />
      </div>

      {/* Sales by Day - Collapsible */}
      <div className="surface-panel overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Historial de Ventas</h3>
            <p className="text-sm text-slate-500 mt-1">Agrupado por día</p>
          </div>
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
          >
            <History size={16} />
            Ver todas
          </button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {salesByDay.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
              <p>No hay ventas registradas</p>
            </div>
          ) : (
            salesByDay.map((day) => (
              <div key={day.date} className="bg-white">
                {/* Day Header */}
                <button
                  onClick={() => toggleDay(day.date)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight 
                      size={20} 
                      className={cn(
                        "text-slate-400 transition-transform",
                        expandedDays.includes(day.date) && "rotate-90"
                      )} 
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{day.dateLabel}</p>
                      <p className="text-xs text-slate-500">{day.count} ventas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      ${day.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      {day.paymentBreakdown.CASH > 0 && (
                        <span className="flex items-center gap-1">
                          <Wallet size={12} /> ${day.paymentBreakdown.CASH.toFixed(0)}
                        </span>
                      )}
                      {day.paymentBreakdown.CARD > 0 && (
                        <span className="flex items-center gap-1">
                          <CreditCard size={12} /> ${day.paymentBreakdown.CARD.toFixed(0)}
                        </span>
                      )}
                      {day.paymentBreakdown.DIGITAL > 0 && (
                        <span className="flex items-center gap-1">
                          <Smartphone size={12} /> ${day.paymentBreakdown.DIGITAL.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                
                {/* Day Sales Details */}
                {expandedDays.includes(day.date) && (
                  <div className="bg-slate-50 px-4 pb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-200">
                          <th className="text-left py-2 font-medium">Folio</th>
                          <th className="text-left py-2 font-medium">Hora</th>
                          <th className="text-left py-2 font-medium">Método</th>
                          <th className="text-right py-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.sales.map(sale => (
                          <tr key={sale.id} className="text-sm border-b border-slate-100 last:border-0">
                            <td className="py-3 font-medium text-slate-700">{sale.id}</td>
                            <td className="py-3 text-slate-500">
                              {formatBogotaDate(new Date(sale.date), { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1.5">
                                {sale.paymentMethod === 'CASH' ? (
                                  <Wallet size={14} className="text-emerald-600" />
                                ) : sale.paymentMethod === 'CARD' ? (
                                  <CreditCard size={14} className="text-blue-600" />
                                ) : (
                                  <Smartphone size={14} className="text-purple-600" />
                                )}
                                <span className="text-slate-600 text-xs">
                                  {sale.paymentMethod === 'CASH' ? 'Efectivo' : 
                                   sale.paymentMethod === 'CARD' ? 'Tarjeta' : 'Digital'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-right font-semibold text-slate-700">
                              ${sale.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showHistoryModal && (
        <SalesHistoryModal 
          sales={sales} 
          role={role} 
          currentSellerId={sellerId}
          onClose={() => setShowHistoryModal(false)} 
        />
      )}
    </div>
  );
};

export default SellerSummary;
