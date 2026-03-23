import React from 'react';
import { Building2, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { Business } from '../types';

interface SuperAdminEmpresasProps {
  businesses: Business[];
}

const SuperAdminEmpresas = ({ businesses }: SuperAdminEmpresasProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Empresas</h2>
          <p className="text-slate-500">Monitorea todas las sucursales del sistema</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar empresa..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map(business => (
          <div key={business.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Building2 size={24} />
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold",
                business.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {business.status}
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">{business.name}</h4>
            <p className="text-sm text-slate-500 mb-4">ID: {business.id}</p>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Dueño:</span>
                <span className="text-slate-700 font-medium">Carlos Ruiz</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ventas (Mes):</span>
                <span className="text-slate-700 font-medium">$12,450.00</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2 bg-slate-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
              Ver Detalles
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminEmpresas;
