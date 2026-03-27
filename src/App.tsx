import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Business, Product, Sale, User } from './types';
import { api } from './services/api';
import { supabase } from './lib/supabase';

// Layout & Common
import Layout from './components/layout/Layout';
import ConfigurationView from './components/common/ConfigurationView';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const SellerTerminal = lazy(() => import('./pages/SellerTerminal'));
const SellerSummary = lazy(() => import('./pages/SellerSummary'));
const SellerInventory = lazy(() => import('./pages/SellerInventory'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const OwnerReports = lazy(() => import('./pages/OwnerReports'));
const AdminInventory = lazy(() => import('./pages/AdminInventory'));
const SuperAdminPanel = lazy(() => import('./pages/SuperAdminPanel'));
const SuperAdminDueños = lazy(() => import('./pages/SuperAdminDueños'));
const SuperAdminSellers = lazy(() => import('./pages/SuperAdminSellers'));
const SuperAdminEmpresas = lazy(() => import('./pages/SuperAdminEmpresas'));

type AuthUser = {
  id: string;
};

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  business_id?: string;
  avatar?: string;
};

type SaleResult = {
  ok: boolean;
  error?: string;
};

const RouteLoading = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-t-indigo-600 border-r-indigo-200 border-b-indigo-200 border-l-indigo-200 animate-spin" />
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ownerBusinesses, setOwnerBusinesses] = useState<Business[]>([]);
  const [selectedOwnerBusiness, setSelectedOwnerBusiness] = useState<string>('ALL');
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

  const fetchProfile = async (supabaseUser: AuthUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single<ProfileRow>();
    if (profile) {
      let businessName = undefined;
      if (profile.business_id) {
        const business = await api.getBusiness(profile.business_id);
        businessName = business?.name;
      }

      const nextUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        businessId: profile.business_id,
        businessName,
        avatar: profile.avatar
      };
      setUser(nextUser);
      fetchData(nextUser); // Fetch products and sales after login
    }
    setLoadingAuth(false);
  };

  const fetchData = async (activeUser: User) => {
    try {
      const [fetchedProducts, fetchedSales] = await Promise.all([
        api.getProducts(),
        api.getSales()
      ]);

      if (activeUser.role === 'OWNER') {
        const businesses = await api.getBusinessesByOwner(activeUser.id);
        const businessIds = new Set(businesses.map((b) => b.id));

        setOwnerBusinesses(businesses);
        setSelectedOwnerBusiness((prev) => {
          if (businesses.length === 1) return businesses[0].id;
          if (prev === 'ALL' || businessIds.has(prev)) return prev;
          return 'ALL';
        });

        setProducts(fetchedProducts.filter((p) => !!p.businessId && businessIds.has(p.businessId)));
        setSales(fetchedSales.filter((s) => !!s.businessId && businessIds.has(s.businessId)));
        return;
      }

      if (activeUser.role === 'SELLER' && activeUser.businessId) {
        setOwnerBusinesses([]);
        setSelectedOwnerBusiness('ALL');
        setProducts(fetchedProducts.filter((p) => p.businessId === activeUser.businessId));
        setSales(fetchedSales.filter((s) => s.businessId === activeUser.businessId && s.sellerId === activeUser.id));
        return;
      }

      setOwnerBusinesses([]);
      setSelectedOwnerBusiness('ALL');
      setProducts(fetchedProducts);
      setSales(fetchedSales);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const ownerVisibleProducts = user?.role === 'OWNER' && selectedOwnerBusiness !== 'ALL'
    ? products.filter((p) => p.businessId === selectedOwnerBusiness)
    : (user?.role === 'OWNER' && ownerBusinesses.length > 1 ? [] : products);

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

  const handleAddSale = async (sale: Sale): Promise<SaleResult> => {
    try {
      const saleWithBusinessData = {
        ...sale,
        businessId: sale.businessId || user?.businessId,
        sellerName: sale.sellerName || user?.name
      };

      if (!saleWithBusinessData.businessId) {
        throw new Error('Debes seleccionar una empresa para registrar la venta.');
      }
      
      const savedSale = await api.addSale(saleWithBusinessData);
      setSales(prev => [...prev, savedSale]);
      
      // Re-fetch products to ensure local stock matches the database
      const updatedProducts = await api.getProducts();
      // Use internal setProducts directly without triggering handleUpdateProducts' upsert
      if (user?.role === 'OWNER') {
        const ownerBusinessIds = new Set(ownerBusinesses.map((b) => b.id));
        setProducts(updatedProducts.filter((p) => !!p.businessId && ownerBusinessIds.has(p.businessId)));
      } else if (user?.role === 'SELLER' && user.businessId) {
        setProducts(updatedProducts.filter((p) => p.businessId === user.businessId));
      } else {
        setProducts(updatedProducts);
      }

      return { ok: true };
    } catch (error) {
      console.error('Error saving sale:', error);
      const message = error instanceof Error ? error.message : 'No se pudo guardar la venta.';
      return { ok: false, error: message };
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
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    );
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Suspense fallback={<RouteLoading />}>
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
                <Route path="/dashboard" element={<OwnerDashboard products={products} sales={sales} businesses={ownerBusinesses} selectedBusiness={selectedOwnerBusiness} onSelectBusiness={setSelectedOwnerBusiness} />} />
                <Route path="/ventas" element={<SellerTerminal products={ownerVisibleProducts} setProducts={handleUpdateProducts} role={user.role} sellerId={user.id} onSaleComplete={handleAddSale} ownerBusinesses={ownerBusinesses} selectedBusinessId={selectedOwnerBusiness} onSelectedBusinessChange={setSelectedOwnerBusiness} activeBusinessId={selectedOwnerBusiness !== 'ALL' ? selectedOwnerBusiness : undefined} requireBusinessSelection={ownerBusinesses.length > 1} />} />
                <Route path="/reportes" element={<OwnerReports sales={sales} businesses={ownerBusinesses} selectedBusiness={selectedOwnerBusiness} onSelectBusiness={setSelectedOwnerBusiness} />} />
                <Route path="/inventario" element={<AdminInventory products={products} setProducts={handleUpdateProducts} user={user} businesses={ownerBusinesses} selectedBusiness={selectedOwnerBusiness} onSelectBusiness={setSelectedOwnerBusiness} />} />
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
                <Route path="/empresas" element={<SuperAdminEmpresas />} />
                <Route path="/sistema" element={<ConfigurationView role={user.role} user={user} />} />
                <Route path="*" element={<Navigate to="/panel" />} />
              </>
            )}
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
