import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Product, Sale } from './types';
import { MOCK_BUSINESSES } from './data/mock';
import { api } from './services/api';
import { supabase } from './lib/supabase';

// Layout & Common
import Layout from './components/layout/Layout';
import ConfigurationView from './components/common/ConfigurationView';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SellerTerminal from './pages/SellerTerminal';
import SellerSummary from './pages/SellerSummary';
import SellerInventory from './pages/SellerInventory';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerReports from './pages/OwnerReports';
import AdminInventory from './pages/AdminInventory';
import SuperAdminPanel from './pages/SuperAdminPanel';
import SuperAdminDueños from './pages/SuperAdminDueños';
import SuperAdminSellers from './pages/SuperAdminSellers';
import SuperAdminEmpresas from './pages/SuperAdminEmpresas';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Initial fetch of session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user);
      else setLoadingAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (supabaseUser: any) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', supabaseUser.id).single();
    if (profile) {
      let businessName = undefined;
      if (profile.business_id) {
        const business = await api.getBusiness(profile.business_id);
        businessName = business?.name;
      }
      
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        businessId: profile.business_id,
        businessName,
        avatar: profile.avatar
      });
      fetchData(); // Fetch products and sales after login
    }
    setLoadingAuth(false);
  };

  const fetchData = async () => {
    try {
      const [fetchedProducts, fetchedSales] = await Promise.all([
        api.getProducts(),
        api.getSales()
      ]);
      setProducts(fetchedProducts);
      setSales(fetchedSales);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleUpdateProducts = async (newProducts: React.SetStateAction<Product[]>) => {
    setProducts(prev => {
      const updated = typeof newProducts === 'function' ? newProducts(prev) : newProducts;
      
      const updatedWithBusiness = updated.map(p => ({
        ...p,
        businessId: p.businessId || user?.businessId
      }));

      api.updateProducts(updatedWithBusiness).catch(console.error);
      return updatedWithBusiness;
    });
  };

  const handleAddSale = async (sale: Sale) => {
    try {
      const saleWithBusinessData = {
        ...sale,
        businessId: sale.businessId || user?.businessId
      };
      
      const savedSale = await api.addSale(saleWithBusinessData);
      setSales(prev => [...prev, savedSale]);
      
      // Re-fetch products to ensure local stock matches the database
      const updatedProducts = await api.getProducts();
      // Use internal setProducts directly without triggering handleUpdateProducts' upsert
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error saving sale:', error);
      // Even if API fails, update local state to keep UI snappy
      setSales(prev => [...prev, sale]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse">
          <div className="w-8 h-8 rounded-full border-4 border-t-white border-r-white border-b-white/30 border-l-white/30 animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium">Iniciando sistema...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {/* Seller Routes */}
          {user.role === 'SELLER' && (
            <>
              <Route path="/ventas" element={<SellerTerminal products={products} setProducts={handleUpdateProducts} role={user.role} sellerId={user.id} businessName={user.businessName} onSaleComplete={handleAddSale} />} />
              <Route path="/resumen" element={<SellerSummary sales={sales} role={user.role} sellerId={user.id} />} />
              <Route path="/inventario" element={<SellerInventory products={products} />} />
              <Route path="/configuracion" element={<ConfigurationView role={user.role} user={user} />} />
              <Route path="*" element={<Navigate to="/ventas" />} />
            </>
          )}

          {/* Owner Routes */}
          {user.role === 'OWNER' && (
            <>
              <Route path="/dashboard" element={<OwnerDashboard products={products} sales={sales} />} />
              <Route path="/ventas" element={<SellerTerminal products={products} setProducts={handleUpdateProducts} role={user.role} sellerId={user.id} businessId={user.businessId} onSaleComplete={handleAddSale} />} />
              <Route path="/reportes" element={<OwnerReports sales={sales} />} />
              <Route path="/inventario" element={<AdminInventory products={products} setProducts={handleUpdateProducts} user={user} />} />
              <Route path="/configuracion" element={<ConfigurationView role={user.role} user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}

          {/* Super Admin Routes */}
          {user.role === 'SUPER_ADMIN' && (
            <>
              <Route path="/panel" element={<SuperAdminPanel />} />
              <Route path="/dueños" element={<SuperAdminDueños />} />
              <Route path="/vendedores" element={<SuperAdminSellers />} />
              <Route path="/empresas" element={<SuperAdminEmpresas businesses={MOCK_BUSINESSES} />} />
              <Route path="/sistema" element={<ConfigurationView role={user.role} user={user} />} />
              <Route path="*" element={<Navigate to="/panel" />} />
            </>
          )}
        </Routes>
      </Layout>
    </Router>
  );
}
