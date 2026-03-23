import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, BarChart3, Package, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
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
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center gap-2"
              >
                Empezar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm mb-6 border border-indigo-100">
              Versión 2.0 ya disponible 🎉
            </span>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
              Gestiona tus ventas con <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                inteligencia y velocidad
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              El punto de venta más moderno e intuitivo. Controla tu inventario, visualiza reportes en tiempo real y aumenta tus ganancias sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Probar Gratis <ArrowRight size={20} />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-all active:scale-95">
                Ver Demo
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Background Decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10"></div>
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
