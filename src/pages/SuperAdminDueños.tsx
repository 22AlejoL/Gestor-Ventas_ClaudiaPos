import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const SuperAdminDueños = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Dueños</h2>
          <p className="text-slate-500">Administra las cuentas de dueños de negocio</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Plus size={18} />
          Nuevo Dueño
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Dueño</th>
                <th className="px-6 py-4 font-bold">Empresas</th>
                <th className="px-6 py-4 font-bold">Fecha Registro</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Carlos Ruiz', email: 'carlos@tienda.com', companies: 3, date: '2025-10-12', status: 'ACTIVE' },
                { name: 'Ana García', email: 'ana@pan.com', companies: 1, date: '2026-01-05', status: 'ACTIVE' },
                { name: 'Roberto Lima', email: 'roberto@farmacia.com', companies: 2, date: '2026-02-20', status: 'INACTIVE' },
              ].map((owner, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {owner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{owner.name}</p>
                        <p className="text-xs text-slate-400">{owner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{owner.companies}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{owner.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", owner.status === 'ACTIVE' ? "bg-emerald-500" : "bg-rose-500")} />
                      <span className="text-sm text-slate-600">{owner.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDueños;
