import React from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string; // formato YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  max?: string; // fecha máxima (default: hoy)
  min?: string; // fecha mínima opcional
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  max,
  min,
  placeholder = 'Seleccionar fecha'
}) => {
  // Formatear fecha para mostrar (DD/MM/YYYY)
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Establecer fecha máxima por defecto a hoy si no se proporciona
  const maxDate = max || new Date().toISOString().split('T')[0];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Calendar size={18} />
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={maxDate}
          min={min}
          className="w-full h-[46px] pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer transition-all appearance-none"
          style={{
            // Ocultar el icono nativo del input date en webkit
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}
        />
        {value && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none hidden sm:block">
            {formatDisplayDate(value)}
          </div>
        )}
      </div>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default DatePicker;
