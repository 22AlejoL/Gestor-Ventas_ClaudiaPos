import React, { useState } from 'react';
import { Sale, UserRole } from '../../types';
import { Smartphone, Wallet, CreditCard, X } from 'lucide-react';

interface SalesHistoryModalProps {
  sales: Sale[];
  role: UserRole;
  currentSellerId?: string;
  onClose: () => void;
}

const SalesHistoryModal = ({ sales, role, currentSellerId, onClose }: SalesHistoryModalProps) => {
  // Option to filter
  const [filterMonth, setFilterMonth] = useState<string>('');

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
          <select 
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">Todos los meses</option>
            {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
          </select>
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
              <div key={monthKey} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 capitalize">{formatMonth(monthKey)}</h3>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                    Total: ${totalMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider">
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-3 font-bold">Folio / Fecha</th>
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
                        <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{sale.id}</p>
                            <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md bg-white" title={sale.sellerId}>
                                {sale.sellerName || sale.sellerId}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              {sale.paymentMethod === 'CASH' ? <Wallet size={16} /> : sale.paymentMethod === 'CARD' ? <CreditCard size={16} /> : <Smartphone size={16} />}
                              <span className="text-sm">{sale.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative group inline-block">
                              <span className="text-sm text-slate-600 border-b border-dashed border-slate-300 cursor-help">
                                {sale.items?.length || 0} ítems
                              </span>
                              
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max min-w-[150px] max-w-xs bg-slate-800 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-slate-700 pointer-events-none">
                                <p className="font-bold text-slate-400 mb-2 uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1">Artículos Vendidos</p>
                                <div className="flex flex-col gap-1.5">
                                  {sale.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center gap-4">
                                      <span className="font-bold text-indigo-400">{item.quantity}x</span>
                                      <span className="text-right truncate font-medium">{item.productName || 'Producto'}</span>
                                    </div>
                                  ))}
                                </div>
                                {/* Flechita de abajo */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-800"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">
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
