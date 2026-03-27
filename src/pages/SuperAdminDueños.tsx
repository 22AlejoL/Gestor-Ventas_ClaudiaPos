import React, { useState, useEffect } from 'react';
import { Plus, X, ShieldBan, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

type OwnerRow = {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'BLOCKED';
  companies: number;
};

type OwnerProfileRow = {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'BLOCKED';
};

type OwnerBusinessRow = {
  owner_id: string;
};

export default function SuperAdminDueños() {
  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessNames, setBusinessNames] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchOwners = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, status')
      .eq('role', 'OWNER')
      .returns<OwnerProfileRow[]>();
    const { data: businesses } = await supabase
      .from('businesses')
      .select('owner_id')
      .returns<OwnerBusinessRow[]>();

    if (profiles) {
      const formatted = profiles.map(p => {
        const companyCount = businesses?.filter(b => b.owner_id === p.id).length || 0;
        return { ...p, companies: companyCount };
      });
      setOwners(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleAddBusinessField = () => {
    setBusinessNames([...businessNames, '']);
  };

  const handleUpdateBusinessName = (index: number, value: string) => {
    const updated = [...businessNames];
    updated[index] = value;
    setBusinessNames(updated);
  };

  const handleRemoveBusinessField = (index: number) => {
    const updated = businessNames.filter((_, i) => i !== index);
    setBusinessNames(updated);
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setSubmitting(false);
      return;
    }

    const filteredBusinesses = businessNames.filter(b => b.trim() !== '');
    if (filteredBusinesses.length === 0) {
      setError('Debes especificar al menos un nombre de empresa');
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
        role: 'OWNER',
        businesses: filteredBusinesses
      },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });

    if (invokeError) {
      setError(invokeError.message || 'Error al crear el dueño. Verifica la consola.');
      console.error(invokeError);
    } else if (data?.error) {
      setError(data.error);
    } else {
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setBusinessNames(['']);
      fetchOwners();
    }
    setSubmitting(false);
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setActionError('');
    setOwners(prev => prev.map(o => o.id === userId ? { ...o, status: newStatus } : o));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Sesion invalida');
      }

      const { error: invokeError } = await supabase.functions.invoke('manage-users', {
        body: { action: 'toggle_status', targetUserId: userId, status: newStatus },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (invokeError) {
        throw invokeError;
      }
    } catch (e) {
      console.error('Error toggling owner status:', e);
      setOwners(prev => prev.map(o => o.id === userId ? { ...o, status: currentStatus } : o));
      setActionError('No se pudo actualizar el estado del dueño. Intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Dueños</h2>
          <p className="text-slate-500">Administra las cuentas de los líderes de franquicia o empresas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Nuevo Dueño
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {actionError && (
          <div className="mx-6 mt-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
            {actionError}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Dueño</th>
                <th className="px-6 py-4 font-bold">Empresas</th>
                <th className="px-6 py-4 font-bold">ID Referencia</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando dueños...</td>
                </tr>
              ) : owners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay dueños registrados.</td>
                </tr>
              ) : (
                owners.map((owner) => (
                  <tr key={owner.id} className={cn("hover:bg-slate-50 transition-colors", owner.status === 'BLOCKED' && 'opacity-60')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white", owner.status === 'BLOCKED' ? 'bg-slate-300' : 'bg-indigo-600')}>
                          {owner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{owner.name}</p>
                          <p className="text-xs text-slate-400">{owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{owner.companies}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{owner.id.split('-')[0]}...</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", owner.status === 'ACTIVE' ? "bg-emerald-500" : "bg-rose-500")} />
                        <span className="text-sm font-semibold text-slate-600">{owner.status === 'ACTIVE' ? 'Activo' : 'Bloqueado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(owner.id, owner.status)}
                        className={cn("p-2 rounded-lg transition-all", owner.status === 'ACTIVE' ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-rose-500 hover:text-emerald-600 hover:bg-emerald-50")}
                        title={owner.status === 'ACTIVE' ? 'Bloquear Acceso' : 'Habilitar Acceso'}
                      >
                        {owner.status === 'ACTIVE' ? <ShieldBan size={18} /> : <ShieldCheck size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>
            <div className="p-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Nuevo Dueño</h3>
              <p className="text-slate-500 mb-6 text-sm">Crea una cuenta para un emprendedor y define sus empresas iniciales.</p>
              
              {error && (
                <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateOwner} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej. Ana García"
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
                    placeholder="ana@negocio.com"
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

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Empresas Asignadas</label>
                  <div className="space-y-2">
                    {businessNames.map((bName, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={bName}
                          onChange={e => handleUpdateBusinessName(index, e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Nombre de empresa ${index + 1}`}
                        />
                        {businessNames.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBusinessField(index)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBusinessField}
                    className="mt-3 text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={16} /> Añadir otra empresa
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Crear Dueño'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
