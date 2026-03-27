import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { User, UserRole } from '../../types';
import { supabase } from '../../lib/supabase';
import StyledDropdown from './StyledDropdown';

interface ConfigurationViewProps {
  role: UserRole;
  user: User;
  onProfileUpdated?: (updates: Partial<User>) => void;
}

const PHONE_CANDIDATE_KEYS = ['phone', 'phone_number', 'cellphone', 'mobile', 'telefono', 'celular'];

const ConfigurationView = ({ role, user, onProfileUpdated }: ConfigurationViewProps) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('es-MX');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneFieldKey, setPhoneFieldKey] = useState('');
  const [notifications, setNotifications] = useState({
    lowStock: true,
    dailySummary: true,
    newLogins: true,
  });
  const [initialForm, setInitialForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
    language: 'es-MX',
    notifications: {
      lowStock: true,
      dailySummary: true,
      newLogins: true,
    }
  });

  const hasChanges = useMemo(() => {
    return (
      name !== initialForm.name ||
      email !== initialForm.email ||
      phone !== initialForm.phone ||
      language !== initialForm.language ||
      notifications.lowStock !== initialForm.notifications.lowStock ||
      notifications.dailySummary !== initialForm.notifications.dailySummary ||
      notifications.newLogins !== initialForm.notifications.newLogins
    );
  }, [name, email, phone, language, notifications, initialForm]);

  useEffect(() => {
    const fetchProfileSettings = async () => {
      setLoading(true);
      setError('');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError('No se pudo cargar la configuración de tu perfil.');
        setLoading(false);
        return;
      }

      const detectedPhoneKey = PHONE_CANDIDATE_KEYS.find((key) => key in (profile || {})) || '';
      const profilePhone = detectedPhoneKey ? (profile?.[detectedPhoneKey] || '') : '';
      const persistedNotifications = localStorage.getItem(`profile_notifications_${user.id}`);
      let parsedNotifications = { lowStock: true, dailySummary: true, newLogins: true };
      if (persistedNotifications) {
        try {
          parsedNotifications = JSON.parse(persistedNotifications);
        } catch {
          parsedNotifications = { lowStock: true, dailySummary: true, newLogins: true };
        }
      }

      const nextInitial = {
        name: profile?.name || user.name || '',
        email: profile?.email || user.email || '',
        phone: profilePhone,
        language: 'es-MX',
        notifications: parsedNotifications,
      };

      setPhoneFieldKey(detectedPhoneKey);
      setName(nextInitial.name);
      setEmail(nextInitial.email);
      setPhone(nextInitial.phone);
      setLanguage(nextInitial.language);
      setNotifications(nextInitial.notifications);
      setInitialForm(nextInitial);
      setLoading(false);
    };

    fetchProfileSettings();
  }, [user.id, user.name, user.email]);

  const handleCancel = () => {
    setName(initialForm.name);
    setEmail(initialForm.email);
    setPhone(initialForm.phone);
    setLanguage(initialForm.language);
    setNotifications(initialForm.notifications);
    setError('');
    setSuccess('Cambios descartados.');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    const updatePayload: Record<string, any> = {
      name,
      email,
    };

    if (phoneFieldKey) {
      updatePayload[phoneFieldKey] = phone;
    }

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (profileUpdateError) {
      setError('No se pudieron guardar los cambios del perfil.');
      setSaving(false);
      return;
    }

    if (email !== initialForm.email) {
      const { error: authUpdateError } = await supabase.auth.updateUser({ email });
      if (authUpdateError) {
        setError('Se guardó el perfil, pero no se pudo actualizar el correo de acceso.');
        setSaving(false);
        return;
      }
    }

    localStorage.setItem(`profile_notifications_${user.id}`, JSON.stringify(notifications));

    const nextInitial = {
      name,
      email,
      phone,
      language,
      notifications,
    };

    setInitialForm(nextInitial);
    onProfileUpdated?.({ name, email });
    setSuccess('Configuración actualizada correctamente.');
    setSaving(false);
  };

  const notificationItems = [
    {
      key: 'lowStock' as const,
      label: 'Alertas de bajo stock',
      desc: 'Recibe un aviso cuando un producto esté por agotarse',
    },
    {
      key: 'dailySummary' as const,
      label: 'Resumen diario de ventas',
      desc: 'Un reporte matutino con el cierre del día anterior',
    },
    {
      key: 'newLogins' as const,
      label: 'Nuevos inicios de sesión',
      desc: 'Seguridad: te avisamos si alguien entra a tu cuenta',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="text-indigo-600" />
          {role === 'SUPER_ADMIN' ? 'Configuración de Sistema' : role === 'OWNER' ? 'Configuración del Negocio' : 'Mi Perfil'}
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
            {success}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Idioma</label>
              <StyledDropdown
                value={language}
                onChange={setLanguage}
                options={[
                  { value: 'es-MX', label: 'Español (México)' },
                  { value: 'en-US', label: 'English (US)' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4">Notificaciones</h4>
          <div className="space-y-3">
            {notificationItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`w-12 h-6 rounded-full relative transition-colors ${notifications[item.key] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[item.key] ? 'right-1' : 'left-1'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasChanges || saving}
            className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-40"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Guardar Cambios'}
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfigurationView;
