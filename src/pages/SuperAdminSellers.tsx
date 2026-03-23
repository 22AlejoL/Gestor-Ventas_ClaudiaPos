import React, { useState, useEffect } from 'react';
import { Plus, X, ShieldBan, ShieldCheck, Store } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { User, Business } from '../types';

export default function SuperAdminSellers() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSellersAndBusinesses = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'SELLER');
    const { data: fetchedBusinesses } = await supabase.from('businesses').select('*');

    if (fetchedBusinesses) {
      setBusinesses(fetchedBusinesses);
      // Pre-select first business if available
      if (fetchedBusinesses.length > 0) setSelectedBusinessId(fetchedBusinesses[0].id);
    }

    if (profiles) {
      const formatted = profiles.map(p => {
        const b = fetchedBusinesses?.find(bus => bus.id === p.business_id);
        return { ...p, businessName: b ? b.name : 'Sin Asignar' };
      });
      setSellers(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSellersAndBusinesses();
  }, []);

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setSubmitting(false);
      return;
    }

    if (!selectedBusinessId) {
      setError('Debes asignar el vendedor a una empresa');
      setSubmitting(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const { data, error: invokeError } = await supabase.functions.invoke('manage-users', {
      body: { 
        action: 'create_user', 
        email, 
        password, 
        name, 
        role: 'SELLER',
        businessId: selectedBusinessId
      },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });

    if (invokeError) {
      setError(invokeError.message || 'Error al crear el vendedor.');
    } else if (data?.error) {
      setError(data.error);
    } else {
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchSellersAndBusinesses();
    }
    setSubmitting(false);
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setSellers(prev => prev.map(s => s.id === userId ? { ...s, status: newStatus } : s));
    
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.functions.invoke('manage-users', {
      body: { action: 'toggle_status', targetUserId: userId, status: newStatus },
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Vendedores</h2>
          <p className="text-slate-500">Administra los accesos al punto de venta por empresa</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Nuevo Vendedor
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Vendedor</th>
                <th className="px-6 py-4 font-bold">Empresa Asignada</th>
                <th className="px-6 py-4 font-bold">ID Referencia</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando vendedores...</td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay vendedores registrados.</td>
                </tr>
              ) : (
                sellers.map((seller) => (
                  <tr key={seller.id} className={cn("hover:bg-slate-50 transition-colors", seller.status === 'BLOCKED' && 'opacity-60')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white", seller.status === 'BLOCKED' ? 'bg-slate-300' : 'bg-sky-500')}>
                          {seller.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{seller.name}</p>
                          <p className="text-xs text-slate-400">{seller.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-slate-400" />
                        <span className="text-slate-800 font-medium">{seller.businessName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{seller.id.split('-')[0]}...</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", seller.status === 'ACTIVE' ? "bg-emerald-500" : "bg-rose-500")} />
                        <span className="text-sm font-semibold text-slate-600">{seller.status === 'ACTIVE' ? 'Activo' : 'Bloqueado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(seller.id, seller.status)}
                        className={cn("p-2 rounded-lg transition-all", seller.status === 'ACTIVE' ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-rose-500 hover:text-emerald-600 hover:bg-emerald-50")}
                        title={seller.status === 'ACTIVE' ? 'Bloquear Acceso' : 'Habilitar Acceso'}
                      >
                        {seller.status === 'ACTIVE' ? <ShieldBan size={18} /> : <ShieldCheck size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Nuevo Vendedor</h3>
              <p className="text-slate-500 mb-6 text-sm">Crea un acceso para un usuario que usará el punto de venta (Terminal).</p>
              
              {error && (
                <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateSeller} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Empresa Asignada</label>
                  <select
                    required
                    value={selectedBusinessId}
                    onChange={e => setSelectedBusinessId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {businesses.length === 0 && <option value="" disabled>Cargando empresas...</option>}
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="juan@tienda.pos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña Temporal</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Crear Vendedor'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
