import React from 'react';
import { CashRegisterClosure } from '../../types';

interface CashClosureReceiptProps {
  closure: CashRegisterClosure;
  sellerName: string;
  businessName?: string;
}

const CashClosureReceipt = React.forwardRef<HTMLDivElement, CashClosureReceiptProps>(
  ({ closure, sellerName, businessName }, ref) => {
    const closureDate = new Date(closure.createdAt);

    return (
      <div
        ref={ref}
        className="bg-white p-4 sm:p-6 max-w-sm mx-auto text-sm sm:text-base"
        style={{ fontFamily: 'monospace' }}
        data-receipt="cash-closure"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
          <h1 className="text-xl font-bold text-slate-800">CIERRE DE CAJA</h1>
          {businessName && (
            <p className="text-sm font-semibold text-slate-600 mt-1">{businessName}</p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            {closureDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-xs text-slate-500">
            {closureDate.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Seller Info */}
        <div className="mb-4">
          <p className="text-sm">
            <span className="text-slate-500">Vendedor:</span>{' '}
            <span className="font-semibold">{sellerName}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-500">ID Cierre:</span>{' '}
            <span className="font-mono text-xs">{closure.id.slice(-8).toUpperCase()}</span>
          </p>
        </div>

        {/* Cash Flow */}
        <div className="border-t border-b border-slate-200 py-3 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">FLUJO DE EFECTIVO</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Caja Inicial:</span>
              <span className="font-medium">${closure.initialAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ventas en Efectivo:</span>
              <span className="font-medium text-emerald-600">+${closure.paymentBreakdown.cash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Gastos:</span>
              <span className="font-medium text-rose-600">-${closure.expenses.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-1 mt-1">
              <div className="flex justify-between font-bold">
                <span>Efectivo Esperado:</span>
                <span>${(closure.initialAmount + closure.paymentBreakdown.cash).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Caja Final:</span>
              <span className="font-medium">${closure.finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-b border-slate-200 py-3 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">VENTAS POR MÉTODO</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Efectivo:</span>
              <span className="font-medium">${closure.paymentBreakdown.cash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tarjeta:</span>
              <span className="font-medium">${closure.paymentBreakdown.card.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Transferencia:</span>
              <span className="font-medium">${closure.paymentBreakdown.digital.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-1 mt-1">
              <div className="flex justify-between font-bold">
                <span>Total Ventas:</span>
                <span>${closure.totalSales.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Details */}
        {closure.expenses > 0 && closure.expensesDetails && (
          <div className="border-b border-slate-200 py-3 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-2">DETALLE DE GASTOS</h3>
            <p className="text-xs text-slate-600 whitespace-pre-wrap">
              {closure.expensesDetails}
            </p>
          </div>
        )}

        {/* Difference */}
        <div className={`p-3 rounded-lg mb-4 ${closure.difference >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className="text-center">
            <p className={`text-xs font-semibold ${closure.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {closure.difference >= 0 ? 'GANANCIA DEL TURNO' : 'DÉFICIT'}
            </p>
            <p className={`text-2xl font-bold ${closure.difference >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              ${Math.abs(closure.difference).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-dashed border-slate-300">
          <p>ClaudiaPOS - Sistema de Gestión</p>
          <p className="mt-1">Gracias por tu trabajo</p>
          <p className="mt-2">*** FIN DEL REPORTE ***</p>
        </div>
      </div>
    );
  }
);

CashClosureReceipt.displayName = 'CashClosureReceipt';

export default CashClosureReceipt;
