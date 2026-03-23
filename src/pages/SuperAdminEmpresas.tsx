import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { Business } from '../types';
import { supabase } from '../lib/supabase';

const SuperAdminEmpresas = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      // Fetch businesses
      const { data: businessData, error } = await supabase.from('businesses').select('*');
      
      // Fetch profiles to map owner_id to their actual name
      const { data: ownersData } = await supabase.from('profiles').select('id, name');

      if (businessData && ownersData) {
        const enhancedBusinesses = businessData.map(b => {
          const owner = ownersData.find(o => o.id === b.owner_id);
          return {
            ...b,
            ownerName: owner ? owner.name : 'Desconocido'
          };
        });
        setBusinesses(enhancedBusinesses);
      }
      setLoading(false);
    };

    fetchBusinesses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Empresas</h2>
          <p className="text-slate-500">Monitorea todas las sucursales del sistema generadas por los dueños</p>
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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center">
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No hay empresas registradas</h3>
          <p className="text-slate-500">Las empresas se registran automáticamente cuando creas un Dueño.</p>
        </div>
      ) : (
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
                  {business.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">{business.name}</h4>
              <p className="text-xs text-slate-400 font-mono mb-4">ID: {business.id.split('-')[0]}...</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Dueño:</span>
                  <span className="text-slate-700 font-medium">{business.ownerName}</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 bg-slate-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
                Ver Administradores
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminEmpresas;
