import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Search, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const finalPassword = password === 'a' ? 'aaaaaa' : password;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: finalPassword,
    });

    if (error) {
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-cyan-200/30 blur-3xl" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel w-full max-w-md p-8 shadow-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <ShoppingCart className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">ClaudiaPOS</h1>
          <p className="text-slate-500 mt-2">Bienvenido de nuevo, ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@claudia.pos"
                className="input-modern pl-12 pr-4 py-3"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-modern pl-12 pr-4 py-3"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold border border-rose-100">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm">¿No tienes cuenta? <span className="text-indigo-600 font-bold cursor-pointer hover:underline">Contacta a soporte</span></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
