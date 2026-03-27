import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Printer, UserCheck, Wallet, CreditCard, Smartphone, History } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { Sale, UserRole } from '../types';
import SalesHistoryModal from '../components/common/SalesHistoryModal';

interface SellerSummaryProps {
  sales: Sale[];
  role: UserRole;
  sellerId: string;
}

const SellerSummary = ({ sales, role, sellerId }: SellerSummaryProps) => {
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);

  const totalVentas = sales.reduce((acc, s) => acc + s.total, 0);
  const ticketPromedio = sales.length > 0 ? totalVentas / sales.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="section-title">Resumen de mi Turno</h2>
          <p className="section-subtitle">Lunes, 23 de Marzo 2026</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ventas Totales" value={`$${totalVentas.toLocaleString()}`} icon={DollarSign} color="bg-indigo-600" trend="up" trendValue="12%" />
        <StatCard title="Tickets Emitidos" value={sales.length.toString()} icon={ShoppingCart} color="bg-indigo-600" />
        <StatCard title="Promedio Ticket" value={`$${ticketPromedio.toFixed(2)}`} icon={TrendingUp} color="bg-indigo-600" />
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Ventas Recientes</h3>
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
          >
            <History size={16} />
            Ver todas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead className="table-head">
              <tr>
                <th className="table-head-cell">Folio</th>
                <th className="table-head-cell">Hora</th>
                <th className="table-head-cell">Método</th>
                <th className="table-head-cell">Estado</th>
                <th className="table-head-cell text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map(sale => (
                <tr key={sale.id} className="table-row">
                  <td className="table-cell font-bold text-slate-800">{sale.id}</td>
                  <td className="table-cell text-slate-500">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2 text-slate-600">
                      {sale.paymentMethod === 'CASH' ? <Wallet size={16} /> : sale.paymentMethod === 'CARD' ? <CreditCard size={16} /> : <Smartphone size={16} />}
                      <span className="text-sm">{sale.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">Completada</span>
                  </td>
                  <td className="table-cell text-right font-bold text-slate-800">${sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
