import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, BarChart3, Package, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      <div className="absolute -top-40 -left-24 w-[520px] h-[520px] rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="absolute top-24 -right-32 w-[560px] h-[560px] rounded-full bg-cyan-200/35 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-[420px] h-[420px] rounded-full bg-sky-100/60 blur-3xl" />
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-white/75 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <ShoppingCart className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">ClaudiaPOS</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-slate-600 font-semibold hover:text-indigo-600 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary px-6 py-2.5 rounded-full"
              >
                Empezar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="surface-panel p-8 sm:p-12"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm mb-6 border border-indigo-100">
              Versión 2.0 ya disponible 🎉
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 text-center">
              Gestiona tus ventas con <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                inteligencia y velocidad
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed text-center">
              El punto de venta más moderno e intuitivo. Controla tu inventario, visualiza reportes en tiempo real y aumenta tus ganancias sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary w-full sm:w-auto px-8 py-4 rounded-full text-lg"
              >
                Probar Gratis <ArrowRight size={20} />
              </button>
              <button className="btn-secondary w-full sm:w-auto px-8 py-4 rounded-full text-lg">
                Ver Demo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="surface-card p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Empresas activas</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">+120</p>
              </div>
              <div className="surface-card p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Transacciones</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">1.4M</p>
              </div>
              <div className="surface-card p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Disponibilidad</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">99.9%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Todo lo que necesitas para crecer</h2>
            <p className="text-lg text-slate-500">Hemos diseñado cada herramienta pensando en la rapidez y la facilidad de uso para cualquier tipo de negocio.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShoppingCart className="text-indigo-600" size={28} />}
              title="Ventas Ultrarrápidas"
              desc="Agrega productos en segundos, calcula márgenes automáticamente y procesa pagos al instante."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Package className="text-cyan-600" size={28} />}
              title="Inventario Seguro"
              desc="Alertas de stock bajo, seguimiento en tiempo real y categorización inteligente para que nunca te falte nada."
              delay={0.2}
            />
            <FeatureCard 
              icon={<BarChart3 className="text-emerald-600" size={28} />}
              title="Reportes Precisos"
              desc="Decisiones basadas en datos con dashboards visuales que te muestran ganancias, gastos y proyecciones."
              delay={0.3}
            />
          </div>
        </div>
      </div>

      {/* Secondary CTA */}
      <div className="py-24 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">¿Listo para modernizar tu negocio?</h2>
          <p className="text-xl text-slate-400 mb-10">Únete a cientos de dueños de negocios que ya confiaron en ClaudiaPOS.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm font-semibold text-slate-300 mb-10">
            <span className="flex items-center gap-2 justify-center"><CheckCircle2 className="text-indigo-400" size={18} /> Soporte 24/7</span>
            <span className="flex items-center gap-2 justify-center"><CheckCircle2 className="text-indigo-400" size={18} /> Actualizaciones Gratuitas</span>
            <span className="flex items-center gap-2 justify-center"><CheckCircle2 className="text-indigo-400" size={18} /> Sin tarjetas de crédito</span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full font-bold text-xl transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
          >
            Comenzar mi prueba
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
    >
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
