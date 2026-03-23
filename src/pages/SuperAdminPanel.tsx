import React from 'react';
import { DollarSign, Building2, Users, CheckCircle2, Globe } from 'lucide-react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import StatCard from '../components/common/StatCard';

const SuperAdminPanel = () => {
  const data = [
    { name: 'Ene', ingresos: 4000 },
    { name: 'Feb', ingresos: 3000 },
    { name: 'Mar', ingresos: 5000 },
    { name: 'Abr', ingresos: 4500 },
    { name: 'May', ingresos: 6000 },
    { name: 'Jun', ingresos: 7500 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel General del Ecosistema</h2>
          <p className="text-slate-500">Consolidado de todas las empresas y suscripciones</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <Globe size={18} />
            Estado Global
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Ingresos Totales" value="$1.2M" icon={DollarSign} color="bg-indigo-600" trend="up" trendValue="15%" />
        <StatCard title="Empresas Activas" value="156" icon={Building2} color="bg-indigo-600" trend="up" trendValue="4%" />
        <StatCard title="Usuarios Totales" value="1,240" icon={Users} color="bg-indigo-600" />
        <StatCard title="Suscripciones" value="142" icon={CheckCircle2} color="bg-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Crecimiento de Ingresos Anual</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="ingresos" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Actividad Reciente</h3>
          <div className="space-y-6">
            {[
              { type: 'new_business', text: 'Nueva empresa: "Café Central"', time: 'Hace 5 min' },
              { type: 'alert', text: 'Alerta de sistema: Backup completado', time: 'Hace 1 hora' },
              { type: 'new_user', text: 'Nuevo dueño registrado: Carlos Ruiz', time: 'Hace 2 horas' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-1 h-10 bg-indigo-100 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{activity.text}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
            Ver todo el log
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
