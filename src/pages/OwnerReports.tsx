import React from 'react';
import { Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const OwnerReports = () => {
  const data = [
    { name: 'Ene', ventas: 4000, meta: 3500 },
    { name: 'Feb', ventas: 3000, meta: 3500 },
    { name: 'Mar', ventas: 5000, meta: 4000 },
    { name: 'Abr', ventas: 4500, meta: 4000 },
    { name: 'May', ventas: 6000, meta: 4500 },
    { name: 'Jun', ventas: 7500, meta: 5000 },
  ];

  const pieData = [
    { name: 'Efectivo', value: 400, color: '#4f46e5' },
    { name: 'Tarjeta', value: 300, color: '#818cf8' },
    { name: 'Digital', value: 200, color: '#c7d2fe' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reportes de Rendimiento</h2>
          <p className="text-slate-500">Análisis detallado de ventas y rentabilidad</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Últimos 6 meses</option>
            <option>Este año</option>
            <option>Personalizado</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Flujo de Caja Mensual</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="ventas" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="meta" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Métodos de Pago</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{((item.value / 900) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Margen Promedio</p>
          <h4 className="text-2xl font-bold text-slate-800">32.4%</h4>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            +2.1% vs mes anterior
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Ticket Promedio</p>
          <h4 className="text-2xl font-bold text-slate-800">$342.50</h4>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            +5.4% vs mes anterior
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Clientes Nuevos</p>
          <h4 className="text-2xl font-bold text-slate-800">124</h4>
          <div className="mt-2 flex items-center gap-1 text-rose-600 text-xs font-bold">
            <ArrowDownRight size={14} />
            -1.2% vs mes anterior
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Retención</p>
          <h4 className="text-2xl font-bold text-slate-800">68%</h4>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            +0.5% vs mes anterior
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerReports;
