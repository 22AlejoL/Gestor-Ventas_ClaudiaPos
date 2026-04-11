import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Store, 
  AlertCircle, 
  X, 
  Wallet, 
  CreditCard, 
  Smartphone,
  Calculator,
  Receipt,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { CashRegisterOpening, Sale } from '../../types';

interface CloseCashRegisterModalProps {
  sellerName: string;
  businessName?: string;
  opening: CashRegisterOpening;
  todaySales: Sale[];
  onSubmit: (data: {
    finalAmount: number;
    expenses: number;
    expensesDetails: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const CloseCashRegisterModal: React.FC<CloseCashRegisterModalProps> = ({
  sellerName,
  businessName,
  opening,
  todaySales,
  onSubmit,
  onCancel
}) => {
  const [finalAmount, setFinalAmount] = useState('');
  const [expenses, setExpenses] = useState('');
  const [expensesDetails, setExpensesDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate sales breakdown by payment method
  const salesBreakdown = useMemo(() => {
    return todaySales.reduce(
      (acc, sale) => {
        acc.total += sale.total;
        acc[sale.paymentMethod.toLowerCase() as 'cash' | 'card' | 'digital'] += sale.total;
        return acc;
      },
      { cash: 0, card: 0, digital: 0, total: 0 }
    );
  }, [todaySales]);

  // Calculate expected cash in drawer (without subtracting expenses - they're already reflected in final amount)
  const expectedCash = opening.initialAmount + salesBreakdown.cash;

  // Calculate difference
  // The correct formula: difference = finalAmount - initialAmount
  // This gives the real profit/loss because finalAmount already reflects sales - expenses
  const finalAmountNum = parseFloat(finalAmount) || 0;
  const expensesNum = parseFloat(expenses) || 0;
  const difference = finalAmountNum - opening.initialAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (finalAmountNum < 0) {
      setError('El monto final no puede ser negativo');
      return;
    }

    if (expensesNum < 0) {
      setError('Los gastos no pueden ser negativos');
      return;
    }

    if (expensesNum > 0 && !expensesDetails.trim()) {
      setError('Por favor describe los gastos realizados');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        finalAmount: finalAmountNum,
        expenses: expensesNum,
        expensesDetails: expensesDetails.trim()
      });
    } catch (err) {
      setError('Error al cerrar la caja. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col my-2 sm:my-8"
      >
        <div className="p-4 sm:p-6 bg-rose-50 border-b border-rose-100 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Receipt className="text-rose-600" size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">Cierre de Caja</h2>
                <p className="text-xs sm:text-sm text-slate-500 truncate">Finaliza tu turno de ventas</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-rose-100 rounded-xl transition-colors flex-shrink-0"
            >
              <X className="text-slate-400" size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Seller Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-sm text-slate-500 mb-1">Vendedor</p>
              <p className="font-semibold text-slate-800">{sellerName}</p>
            </div>
            {businessName && (
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500 mb-1">Empresa</p>
                <p className="font-semibold text-slate-800">{businessName}</p>
              </div>
            )}
          </div>

          {/* Sales Summary */}
          <div className="bg-indigo-50 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calculator size={18} className="text-indigo-600" />
              Resumen de Ventas del Día
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-3">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Wallet size={16} />
                  <span className="text-xs font-medium">Efectivo</span>
                </div>
                <p className="font-bold text-slate-800">
                  ${salesBreakdown.cash.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <CreditCard size={16} />
                  <span className="text-xs font-medium">Tarjeta</span>
                </div>
                <p className="font-bold text-slate-800">
                  ${salesBreakdown.card.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Smartphone size={16} />
                  <span className="text-xs font-medium">Digital</span>
                </div>
                <p className="font-bold text-slate-800">
                  ${salesBreakdown.digital.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-indigo-100 rounded-xl p-3">
                <p className="text-xs text-indigo-600 font-medium mb-1">Total Ventas</p>
                <p className="font-bold text-indigo-700">
                  ${salesBreakdown.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Cash Flow */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Flujo de Efectivo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500 mb-1">Caja Inicial</p>
                <p className="text-2xl font-bold text-slate-800">
                  ${opening.initialAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4">
                <p className="text-sm text-emerald-600 mb-1">Efectivo Esperado</p>
                <p className="text-2xl font-bold text-emerald-700">
                  ${expectedCash.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Inicial + ventas en efectivo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Caja Final en Efectivo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <DollarSign size={20} />
                  </div>
                  <input
                    type="number"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full pl-12 pr-4 py-3 text-xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Gastos del Día
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <TrendingDown size={20} />
                  </div>
                  <input
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 text-xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {expensesNum > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Detalle de Gastos <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={expensesDetails}
                  onChange={(e) => setExpensesDetails(e.target.value)}
                  placeholder="Ej: Pago domicilio $10.000, Compra insumos $25.000..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
              </div>
            )}

            {/* Difference calculation */}
            <div className={`rounded-2xl p-5 ${difference >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    difference >= 0 ? 'bg-emerald-100' : 'bg-rose-100'
                  }`}>
                    {difference >= 0 ? (
                      <TrendingUp className={difference >= 0 ? 'text-emerald-600' : 'text-rose-600'} size={24} />
                    ) : (
                      <TrendingDown className="text-rose-600" size={24} />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${difference >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {difference >= 0 ? 'Ganancia del Turno' : 'Déficit'}
                    </p>
                    <p className={`text-2xl sm:text-3xl font-bold ${difference >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      ${Math.abs(difference).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="text-right sm:text-right">
                  <p className="text-xs text-slate-500">Cálculo:</p>
                  <p className="text-sm text-slate-600">
                    Final (${finalAmountNum || 0}) - Inicial (${opening.initialAmount})
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Los gastos ya están reflejados en la caja final
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 pt-4 border-t border-slate-100 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 btn-secondary py-2.5 sm:py-3 text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !finalAmount}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Receipt size={16} className="sm:w-[18px] sm:h-[18px]" />
              {loading ? 'Procesando...' : 'Cerrar e Imprimir'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CloseCashRegisterModal;
