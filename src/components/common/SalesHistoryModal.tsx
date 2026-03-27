import React, { useState } from 'react';
import { Business, Sale, UserRole } from '../../types';
import { Smartphone, Wallet, CreditCard, X } from 'lucide-react';
import StyledDropdown from './StyledDropdown';

interface SalesHistoryModalProps {
  sales: Sale[];
  role: UserRole;
  currentSellerId?: string;
  businesses?: Business[];
  onClose: () => void;
}

const SalesHistoryModal = ({ sales, role, currentSellerId, businesses = [], onClose }: SalesHistoryModalProps) => {
  // Option to filter
  const [filterMonth, setFilterMonth] = useState<string>('');

  const businessNameById = businesses.reduce((acc, business) => {
    acc[business.id] = business.name;
    return acc;
  }, {} as Record<string, string>);

  const getTotalSoldUnits = (sale: Sale) => {
    return sale.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  };

  // Group sales by month (YYYY-MM)
  const groupedSales = sales.reduce((acc, sale) => {
    const date = new Date(sale.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);

  const months = Object.keys(groupedSales).sort((a, b) => b.localeCompare(a)); // Descending

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Historial Completo de Ventas</h2>
            <p className="text-sm text-slate-500">Trazabilidad mes a mes por vendedor</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="w-64">
            <StyledDropdown
              value={filterMonth}
              onChange={setFilterMonth}
              options={[
                { value: '', label: 'Todos los meses' },
                ...months.map((month) => ({ value: month, label: formatMonth(month) }))
              ]}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {months.filter(m => filterMonth ? m === filterMonth : true).map(monthKey => {
            let monthSales = groupedSales[monthKey];
            
            // If seller, optionally filter by their own sales, but the prompt says 
            // "ver la trazabilidad completa ... mes a mes por vendedor". If they only see theirs:
            if (role === 'SELLER' && currentSellerId) {
              monthSales = monthSales.filter(s => s.sellerId === currentSellerId);
            }

            if (monthSales.length === 0) return null;

            const totalMonth = monthSales.reduce((acc, s) => acc + s.total, 0);

            return (
              <div key={monthKey} className="bg-white border border-slate-200 rounded-2xl overflow-visible shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 capitalize">{formatMonth(monthKey)}</h3>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                    Total: ${totalMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="table-shell">
                    <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider">
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-3 font-bold">Folio / Fecha</th>
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
                      {monthSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(sale => (
                        <tr key={sale.id} className="table-row">
                          <td className="table-cell">
                            <p className="font-bold text-slate-800">{sale.id}</p>
                            <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
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
                              <span className="text-sm">{sale.paymentMethod}</span>
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
              </div>
            );
          })}

          {months.length === 0 && (
            <div className="text-center text-slate-500 py-12">
              <p>No hay ventas registradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryModal;
