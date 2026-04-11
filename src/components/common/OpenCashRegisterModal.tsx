import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Store, AlertCircle, X } from 'lucide-react';
import { CashRegisterOpening } from '../../types';

interface OpenCashRegisterModalProps {
  sellerName: string;
  businessName?: string;
  onSubmit: (initialAmount: number) => Promise<void>;
  onCancel?: () => void;
  existingOpening?: CashRegisterOpening | null;
  requireOpening?: boolean;
}

const OpenCashRegisterModal: React.FC<OpenCashRegisterModalProps> = ({
  sellerName,
  businessName,
  onSubmit,
  onCancel,
  existingOpening,
  requireOpening = false
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const initialAmount = parseFloat(amount);
    if (isNaN(initialAmount) || initialAmount < 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(initialAmount);
    } catch (err: any) {
      console.error('Error creating opening:', err);
      // Only show error if it's not a fallback scenario
      // The API now handles Supabase errors silently with localStorage fallback
      if (err?.message?.includes('network') || err?.message?.includes('offline')) {
        setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
      }
      // Most other errors are handled by localStorage fallback silently
    } finally {
      setLoading(false);
    }
  };

  // Si ya existe una apertura para hoy, mostrar mensaje informativo
  if (existingOpening) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4"
        onClick={requireOpening ? undefined : (e) => e.target === e.currentTarget && onCancel?.()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col"
        >
          <div className="p-4 sm:p-6 bg-emerald-50 border-b border-emerald-100 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Store className="text-emerald-600" size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">Caja ya abierta</h2>
                <p className="text-xs sm:text-sm text-slate-500 truncate">Tu turno ya está activo</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-sm text-slate-500 mb-1">Monto inicial registrado</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                ${existingOpening.initialAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 bg-amber-50 p-3 sm:p-4 rounded-xl">
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
              <p>
                Ya realizaste la apertura de caja hoy. Si necesitas modificar el monto inicial, 
                contacta al administrador del sistema.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
            <button
              onClick={onCancel}
              className="w-full btn-primary py-2.5 sm:py-3 text-sm sm:text-base"
            >
              Continuar al sistema
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4"
      onClick={requireOpening ? undefined : (e) => e.target === e.currentTarget && onCancel?.()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 sm:p-6 bg-indigo-50 border-b border-indigo-100 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Store className="text-indigo-600" size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">Apertura de Caja</h2>
              <p className="text-xs sm:text-sm text-slate-500 truncate">Inicia tu turno de ventas</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <p className="text-sm text-slate-500">Vendedor</p>
              <p className="font-semibold text-slate-800">{sellerName}</p>
            </div>

            {businessName && (
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <p className="text-sm text-slate-500">Empresa</p>
                <p className="font-semibold text-slate-800">{businessName}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Monto inicial en caja <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <DollarSign size={20} />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Ingresa el valor con el que inicias tu turno en efectivo
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {requireOpening && (
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>Debes ingresar el monto inicial de caja para poder realizar ventas.</p>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            {onCancel && !requireOpening && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 btn-secondary py-2.5 sm:py-3 text-sm sm:text-base"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 btn-primary py-2.5 sm:py-3 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Abriendo...' : 'Abrir Caja'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OpenCashRegisterModal;
