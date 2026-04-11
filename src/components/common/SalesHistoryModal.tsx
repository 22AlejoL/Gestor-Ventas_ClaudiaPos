import React, { useState, useMemo } from 'react';
import { Business, Sale, UserRole } from '../../types';
import { Smartphone, Wallet, CreditCard, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import StyledDropdown from './StyledDropdown';
import {
  getBogotaDate,
  getRelativeDateBogota,
  formatBogotaDate,
  isSameDayBogota
} from '../../lib/date-utils';

interface SalesHistoryModalProps {
  sales: Sale[];
  role: UserRole;
  currentSellerId?: string;
  businesses?: Business[];
  onClose: () => void;
}

type PeriodFilter = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'ALL';

interface DayGroup {
  date: string;
  dateLabel: string;
  sales: Sale[];
  total: number;
  isExpanded: boolean;
}

const SalesHistoryModal = ({ sales, role, currentSellerId, businesses = [], onClose }: SalesHistoryModalProps) => {
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const businessNameById = businesses.reduce((acc, business) => {
    acc[business.id] = business.name;
    return acc;
  }, {} as Record<string, string>);

  const getTotalSoldUnits = (sale: Sale) => {
    return sale.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  };

  // Filter sales by period
  const filteredSalesByPeriod = useMemo(() => {
    const today = getBogotaDate();
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      
      switch (periodFilter) {
        case 'TODAY':
          return isSameDayBogota(saleDate, today);
        case 'LAST_7_DAYS':
          const sevenDaysAgo = getRelativeDateBogota(-7);
          return saleDate >= sevenDaysAgo;
        case 'LAST_30_DAYS':
          const thirtyDaysAgo = getRelativeDateBogota(-30);
          return saleDate >= thirtyDaysAgo;
        case 'THIS_MONTH':
          return saleDate.getMonth() === today.getMonth() && 
                 saleDate.getFullYear() === today.getFullYear();
        case 'LAST_MONTH':
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return saleDate.getMonth() === lastMonth.getMonth() && 
                 saleDate.getFullYear() === lastMonth.getFullYear();
        case 'ALL':
        default:
          return true;
      }
    });
  }, [sales, periodFilter]);

  // Group sales by day
  const groupedByDay = useMemo(() => {
    const grouped = new Map<string, Sale[]>();
    
    filteredSalesByPeriod.forEach(sale => {
      // Filter by seller if needed
      if (role === 'SELLER' && currentSellerId && sale.sellerId !== currentSellerId) {
        return;
      }
      
      const dateKey = sale.date.split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(sale);
    });

    // Convert to array and sort by date descending
    return Array.from(grouped.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, daySales]): DayGroup => {
        const dateObj = new Date(date + 'T00:00:00-05:00');
        const today = getBogotaDate();
        const yesterday = getRelativeDateBogota(-1);
        
        let dateLabel: string;
        if (isSameDayBogota(dateObj, today)) {
          dateLabel = 'Hoy';
        } else if (isSameDayBogota(dateObj, yesterday)) {
          dateLabel = 'Ayer';
        } else {
          dateLabel = formatBogotaDate(dateObj, {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          });
        }

        return {
          date,
          dateLabel,
          sales: daySales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          total: daySales.reduce((sum, s) => sum + s.total, 0),
          isExpanded: expandedDays.has(date)
        };
      });
  }, [filteredSalesByPeriod, role, currentSellerId, expandedDays]);

  // Also group by month for the month filter dropdown
  const groupedSales = useMemo(() => {
    return filteredSalesByPeriod.reduce((acc, sale) => {
      // Filter by seller if needed
      if (role === 'SELLER' && currentSellerId && sale.sellerId !== currentSellerId) {
        return acc;
      }
      
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(sale);
      return acc;
    }, {} as Record<string, Sale[]>);
  }, [filteredSalesByPeriod, role, currentSellerId]);

  const months = Object.keys(groupedSales).sort((a, b) => b.localeCompare(a));

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return formatBogotaDate(date, { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedDays(new Set(groupedByDay.map(d => d.date)));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  const periodOptions = [
    { value: 'TODAY', label: 'Hoy' },
    { value: 'LAST_7_DAYS', label: 'Últimos 7 días' },
    { value: 'LAST_30_DAYS', label: 'Últimos 30 días' },
    { value: 'THIS_MONTH', label: 'Este mes' },
    { value: 'LAST_MONTH', label: 'Mes pasado' },
    { value: 'ALL', label: 'Todo el historial' },
  ];

  const totalFilteredSales = groupedByDay.reduce((sum, day) => sum + day.total, 0);
  const totalFilteredCount = groupedByDay.reduce((sum, day) => sum + day.sales.length, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Historial Completo de Ventas</h2>
            <p className="text-sm text-slate-500">Trazabilidad detallada por período</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">Período:</span>
          </div>
          <div className="w-48">
            <StyledDropdown
              value={periodFilter}
              onChange={(value) => setPeriodFilter(value as PeriodFilter)}
              options={periodOptions}
            />
          </div>
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <div className="w-48">
            <StyledDropdown
              value={filterMonth}
              onChange={setFilterMonth}
              options={[
                { value: '', label: 'Todos los meses' },
                ...months.map((month) => ({ value: month, label: formatMonth(month) }))
              ]}
            />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Expandir todo
            </button>
            <button
              onClick={collapseAll}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Colapsar todo
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold">Total Ventas</span>
              <p className="text-lg font-bold text-slate-800">{totalFilteredCount}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold">Monto Total</span>
              <p className="text-lg font-bold text-indigo-600">${totalFilteredSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold">Días con ventas</span>
              <p className="text-lg font-bold text-slate-800">{groupedByDay.length}</p>
            </div>
          </div>
        </div>

        {/* Sales by Day List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {groupedByDay.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium mb-1">No hay ventas registradas</p>
              <p className="text-sm">No se encontraron ventas para el período seleccionado</p>
            </div>
          ) : (
            groupedByDay.map((day) => (
              <div key={day.date} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Day Header */}
                <button
                  onClick={() => toggleDay(day.date)}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    {expandedDays.has(day.date) ? (
                      <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400" />
                    )}
                    <div className="text-left">
                      <h3 className="text-base font-bold text-slate-800 capitalize">{day.dateLabel}</h3>
                      <p className="text-xs text-slate-500">{day.sales.length} ventas</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">
                    ${day.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </button>

                {/* Day Sales Table */}
                {expandedDays.has(day.date) && (
                  <div className="overflow-x-auto">
                    <table className="table-shell">
                      <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider">
                        <tr className="border-b border-slate-100">
                          <th className="px-6 py-3 font-bold">Folio / Hora</th>
                          {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                            <th className="px-6 py-3 font-bold">Empresa</th>
                          )}
                          {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                            <th className="px-6 py-3 font-bold">Vendedor</th>
                          )}
                          <th className="px-6 py-3 font-bold">Método</th>
                          <th className="px-6 py-3 font-bold">Artículos</th>
                          <th className="px-6 py-3 font-bold text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {day.sales.map(sale => (
                          <tr key={sale.id} className="table-row">
                            <td className="table-cell">
                              <p className="font-bold text-slate-800">{sale.id}</p>
                              <p className="text-xs text-slate-500">
                                {formatBogotaDate(new Date(sale.date), { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>
                            {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                              <td className="table-cell">
                                <span className="text-xs font-medium text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md bg-white">
                                  {sale.businessId ? (businessNameById[sale.businessId] || 'Empresa no disponible') : 'Sin empresa registrada'}
                                </span>
                              </td>
                            )}
                            {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                              <td className="table-cell">
                                <span className="text-sm font-medium text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md bg-white">
                                  {sale.sellerName || 'Sin nombre registrado'}
                                </span>
                              </td>
                            )}
                            <td className="table-cell">
                              <div className="flex items-center gap-2 text-slate-600">
                                {sale.paymentMethod === 'CASH' ? <Wallet size={16} /> : sale.paymentMethod === 'CARD' ? <CreditCard size={16} /> : <Smartphone size={16} />}
                                <span className="text-sm">
                                  {sale.paymentMethod === 'CASH' ? 'Efectivo' : 
                                   sale.paymentMethod === 'CARD' ? 'Tarjeta' : 'Digital'}
                                </span>
                              </div>
                            </td>
                            <td className="table-cell">
                              <div className="relative group inline-block">
                                <span className="text-sm text-slate-600 border-b border-dashed border-slate-300 cursor-help">
                                  {getTotalSoldUnits(sale)} items vendidos
                                </span>
                                
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 max-w-[calc(100vw-5rem)] bg-slate-900 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-slate-700 pointer-events-none">
                                  <p className="font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1">
                                    {getTotalSoldUnits(sale)} items vendidos
                                  </p>
                                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                    {sale.items?.map((item, idx) => (
                                      <div key={idx} className="flex items-start justify-between gap-3">
                                        <span className="font-bold text-indigo-300 whitespace-nowrap">{item.quantity}x</span>
                                        <span className="text-right font-medium whitespace-normal break-words text-slate-100">
                                          {item.productName || 'Producto'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-slate-900"></div>
                                </div>
                              </div>
                            </td>
                            <td className="table-cell text-right font-bold text-slate-800">
                              ${sale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    </div>
  );
};

export default SalesHistoryModal;
