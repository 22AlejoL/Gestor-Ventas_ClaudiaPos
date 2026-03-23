import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types';

interface ConfigurationViewProps {
  role: UserRole;
}

const ConfigurationView = ({ role }: ConfigurationViewProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="text-indigo-600" />
          {role === 'SUPER_ADMIN' ? 'Configuración de Sistema' : role === 'OWNER' ? 'Configuración del Negocio' : 'Mi Perfil'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
              <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="Claudia Martínez" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
              <input type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="claudia@negocio.com" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
              <input type="tel" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="+52 55 1234 5678" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Idioma</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Español (México)</option>
                <option>English (US)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4">Notificaciones</h4>
          <div className="space-y-3">
            {[
              { label: 'Alertas de bajo stock', desc: 'Recibe un aviso cuando un producto esté por agotarse' },
              { label: 'Resumen diario de ventas', desc: 'Un reporte matutino con el cierre del día anterior' },
              { label: 'Nuevos inicios de sesión', desc: 'Seguridad: te avisamos si alguien entra a tu cuenta' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
          <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationView;
