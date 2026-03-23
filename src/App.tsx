import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Product, Sale } from './types';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_BUSINESSES } from './data/mock';
import { api } from './services/api';

// Layout & Common
import Layout from './components/layout/Layout';
import ConfigurationView from './components/common/ConfigurationView';

// Pages
import Login from './pages/Login';
import SellerTerminal from './pages/SellerTerminal';
import SellerSummary from './pages/SellerSummary';
import SellerInventory from './pages/SellerInventory';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerReports from './pages/OwnerReports';
import AdminInventory from './pages/AdminInventory';
import SuperAdminPanel from './pages/SuperAdminPanel';
import SuperAdminDueños from './pages/SuperAdminDueños';
import SuperAdminEmpresas from './pages/SuperAdminEmpresas';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedSales] = await Promise.all([
          api.getProducts(),
          api.getSales()
        ]);
        
        // If no products in DB yet, use mock and save them
        if (fetchedProducts.length === 0) {
          await api.updateProducts(MOCK_PRODUCTS);
          setProducts(MOCK_PRODUCTS);
        } else {
          setProducts(fetchedProducts);
        }
        setSales(fetchedSales);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock on error
        setProducts(MOCK_PRODUCTS);
        setSales(MOCK_SALES);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProducts = async (newProducts: React.SetStateAction<Product[]>) => {
    setProducts(prev => {
      const updated = typeof newProducts === 'function' ? newProducts(prev) : newProducts;
      api.updateProducts(updated).catch(console.error);
      return updated;
    });
  };

  const handleAddSale = async (sale: Sale) => {
    try {
      const savedSale = await api.addSale(sale);
      setSales(prev => [...prev, savedSale]);
    } catch (error) {
      console.error('Error saving sale:', error);
      // Even if API fails, update local state to keep UI snappy
      setSales(prev => [...prev, sale]);
    }
  };

  const handleLogin = (role: UserRole) => {
    setUser({
      id: '1',
      name: role === 'SUPER_ADMIN' ? 'Admin Sistema' : role === 'OWNER' ? 'Claudia Martínez' : 'Vendedor 1',
      email: role.toLowerCase() + '@claudia.pos',
      role
    });
  };

  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {/* Seller Routes */}
          {user.role === 'SELLER' && (
            <>
              <Route path="/ventas" element={<SellerTerminal products={products} setProducts={handleUpdateProducts} role={user.role} onSaleComplete={handleAddSale} />} />
              <Route path="/resumen" element={<SellerSummary sales={sales} />} />
              <Route path="/inventario" element={<SellerInventory products={products} />} />
              <Route path="/configuracion" element={<ConfigurationView role={user.role} />} />
              <Route path="*" element={<Navigate to="/ventas" />} />
            </>
          )}

          {/* Owner Routes */}
          {user.role === 'OWNER' && (
            <>
              <Route path="/dashboard" element={<OwnerDashboard products={products} />} />
              <Route path="/ventas" element={<SellerTerminal products={products} setProducts={handleUpdateProducts} role={user.role} onSaleComplete={handleAddSale} />} />
              <Route path="/reportes" element={<OwnerReports />} />
              <Route path="/inventario" element={<AdminInventory products={products} setProducts={handleUpdateProducts} />} />
              <Route path="/configuracion" element={<ConfigurationView role={user.role} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}

          {/* Super Admin Routes */}
          {user.role === 'SUPER_ADMIN' && (
            <>
              <Route path="/panel" element={<SuperAdminPanel />} />
              <Route path="/dueños" element={<SuperAdminDueños />} />
              <Route path="/empresas" element={<SuperAdminEmpresas businesses={MOCK_BUSINESSES} />} />
              <Route path="/sistema" element={<ConfigurationView role={user.role} />} />
              <Route path="*" element={<Navigate to="/panel" />} />
            </>
          )}
        </Routes>
      </Layout>
    </Router>
  );
}
