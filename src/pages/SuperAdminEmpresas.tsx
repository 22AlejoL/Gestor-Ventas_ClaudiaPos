import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, X, UserRound, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';
import { Business } from '../types';
import { supabase } from '../lib/supabase';

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  status?: 'ACTIVE' | 'BLOCKED';
  role?: string;
};

const SuperAdminEmpresas = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [businessAdmins, setBusinessAdmins] = useState<AdminProfile[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return 'No disponible';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return 'No disponible';
    return parsed.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const openCompanyDetails = async (business: any) => {
    setSelectedBusiness(business);
    setIsDetailsModalOpen(true);
    setBusinessAdmins([]);
    setLoadingDetails(true);

    const ownerId = business.owner_id;
    const adminMap = new Map<string, AdminProfile>();

    if (ownerId) {
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('id, name, email, status, role')
        .eq('id', ownerId);

      ownerData?.forEach((admin: AdminProfile) => {
        adminMap.set(admin.id, admin);
      });
    }

    const { data: relatedAdmins } = await supabase
      .from('profiles')
      .select('id, name, email, status, role')
      .eq('business_id', business.id)
      .eq('role', 'OWNER');

    relatedAdmins?.forEach((admin: AdminProfile) => {
      adminMap.set(admin.id, admin);
    });

    setBusinessAdmins(Array.from(adminMap.values()));
    setLoadingDetails(false);
  };

  const closeCompanyDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedBusiness(null);
    setBusinessAdmins([]);
  };

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

              <button
                onClick={() => openCompanyDetails(business)}
                className="w-full mt-6 py-2 bg-slate-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all"
              >
                Ver Administradores
              </button>
            </div>
          ))}
        </div>
      )}

      {isDetailsModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeCompanyDetails}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="p-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Resumen de Empresa</h3>
              <p className="text-slate-500 mb-6 text-sm">Características generales y administradores vinculados.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Nombre</p>
                  <p className="font-bold text-slate-800">{selectedBusiness.name}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Estado</p>
                  <p className={cn(
                    'font-bold',
                    selectedBusiness.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'
                  )}>
                    {selectedBusiness.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Administrador principal</p>
                  <p className="font-bold text-slate-800">{selectedBusiness.ownerName || 'Desconocido'}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Referencia</p>
                  <p className="font-mono text-sm text-slate-700">{selectedBusiness.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <CalendarDays size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Creada</p>
                    <p className="font-semibold text-slate-700">{formatDate(selectedBusiness.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <UserRound size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Total administradores</p>
                    <p className="font-semibold text-slate-700">{loadingDetails ? 'Cargando...' : businessAdmins.length}</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <p className="font-bold text-slate-700 text-sm">Administradores de la empresa</p>
                </div>

                {loadingDetails ? (
                  <div className="p-6 text-sm text-slate-500">Cargando administradores...</div>
                ) : businessAdmins.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">No hay administradores vinculados a esta empresa.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {businessAdmins.map((admin) => (
                      <div key={admin.id} className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">{admin.name}</p>
                          <p className="text-xs text-slate-500">{admin.email}</p>
                        </div>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-[10px] font-bold',
                          admin.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        )}>
                          {admin.status === 'ACTIVE' ? 'Activo' : 'Bloqueado'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminEmpresas;
