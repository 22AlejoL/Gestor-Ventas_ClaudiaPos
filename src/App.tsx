import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Business, Product, Sale, User, CashRegisterOpening, CashRegisterClosure } from './types';
import { api } from './services/api';
import { supabase } from './lib/supabase';

// Layout & Common
import Layout from './components/layout/Layout';
import ConfigurationView from './components/common/ConfigurationView';
import OpenCashRegisterModal from './components/common/OpenCashRegisterModal';
import CloseCashRegisterModal from './components/common/CloseCashRegisterModal';
import CashClosureReceipt from './components/common/CashClosureReceipt';

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
  
  // Cash Register states
  const [cashOpening, setCashOpening] = useState<CashRegisterOpening | null | undefined>(undefined);
  const [cashClosure, setCashClosure] = useState<CashRegisterClosure | null>(null);
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [closureReceipt, setClosureReceipt] = useState<CashRegisterClosure | null>(null);
  const [requireCashOpening, setRequireCashOpening] = useState(false);
  const closureReceiptRef = React.useRef<HTMLDivElement>(null);

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
      await fetchData(nextUser); // Fetch products and sales after login
      await checkCashOpening(nextUser); // Check cash opening for sellers
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

  // Check if seller has opened cash register today
  const checkCashOpening = async (activeUser: User) => {
    if (activeUser.role !== 'SELLER') {
      setCashOpening(null);
      setCashClosure(null);
      setRequireCashOpening(false);
      return;
    }

    try {
      const [opening, closure] = await Promise.all([
        api.getTodayOpening(activeUser.id, activeUser.businessId),
        api.getTodayClosure(activeUser.id)
      ]);
      setCashOpening(opening);
      setCashClosure(closure);
      // Require opening if no opening exists
      const needsOpening = !opening;
      setRequireCashOpening(needsOpening);
      setShowOpeningModal(needsOpening);
    } catch (error) {
      console.error('Error checking cash opening:', error);
      setCashOpening(null);
      setCashClosure(null);
      setRequireCashOpening(true);
      setShowOpeningModal(true);
    }
  };

  const handleCreateOpening = async (initialAmount: number) => {
    if (!user) return;

    try {
      const newOpening = await api.createOpening({
        sellerId: user.id,
        sellerName: user.name,
        businessId: user.businessId,
        date: new Date().toISOString().split('T')[0],
        initialAmount
      });
      setCashOpening(newOpening);
      setRequireCashOpening(false);
      setShowOpeningModal(false);
    } catch (error) {
      console.error('Error creating opening:', error);
      throw error;
    }
  };

  const handleReopenShift = () => {
    // Allow opening a new shift even if one was already closed today
    setCashClosure(null);
    setRequireCashOpening(true);
    setShowOpeningModal(true);
  };

  const handleCloseShift = async (data: { finalAmount: number; expenses: number; expensesDetails: string }) => {
    if (!user || !cashOpening) return;

    try {
      // Calculate payment breakdown from today's sales
      const today = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter(sale => {
        const saleDate = sale.date.split('T')[0];
        return saleDate === today && sale.sellerId === user.id;
      });

      const paymentBreakdown = todaySales.reduce(
        (acc, sale) => {
          acc[sale.paymentMethod.toLowerCase() as 'cash' | 'card' | 'digital'] += sale.total;
          return acc;
        },
        { cash: 0, card: 0, digital: 0 }
      );

      const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
      // Correct calculation: difference is final - initial (expenses are already reflected in final amount)
      const difference = data.finalAmount - cashOpening.initialAmount;

      const closure = await api.createClosure({
        sellerId: user.id,
        sellerName: user.name,
        businessId: user.businessId,
        date: today,
        openingId: cashOpening.id,
        initialAmount: cashOpening.initialAmount,
        finalAmount: data.finalAmount,
        expenses: data.expenses,
        expensesDetails: data.expensesDetails,
        difference,
        paymentBreakdown,
        totalSales
      });

      setCashClosure(closure);
      setClosureReceipt(closure);
      setShowClosingModal(false);
    } catch (error) {
      console.error('Error creating closure:', error);
      throw error;
    }
  };

  const handlePrintReceipt = () => {
    // Add a class to body for print-specific styling
    document.body.classList.add('printing-receipt');

    // Find the receipt element and clone it for printing
    const receiptElement = closureReceiptRef.current;
    if (receiptElement) {
      // Create a print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const receiptHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Ticket de Cierre - ${user?.name || 'Vendedor'}</title>
            <style>
              @media print {
                body { margin: 0; padding: 10px; font-family: monospace; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
              body {
                font-family: 'Courier New', Courier, monospace;
                font-size: 12px;
                line-height: 1.4;
                max-width: 300px;
                margin: 0 auto;
                padding: 10px;
              }
              .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }
              .header h1 { font-size: 16px; margin: 0; font-weight: bold; }
              .header p { margin: 3px 0; }
              .section { margin-bottom: 10px; }
              .section-title { font-weight: bold; margin-bottom: 5px; }
              .row { display: flex; justify-content: space-between; margin: 3px 0; }
              .total { border-top: 1px solid #ccc; padding-top: 5px; margin-top: 5px; font-weight: bold; }
              .difference { padding: 8px; margin: 10px 0; text-align: center; border-radius: 4px; }
              .difference.positive { background: #d1fae5; }
              .difference.negative { background: #fee2e2; }
              .difference.positive .amount { color: #065f46; }
              .difference.negative .amount { color: #991b1b; }
              .footer { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc; font-size: 10px; color: #666; }
            </style>
          </head>
          <body>
            ${receiptElement.innerHTML}
          </body>
          </html>
        `;
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }

    document.body.classList.remove('printing-receipt');
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
      {/* Cash Register Opening Modal for Sellers */}
      {showOpeningModal && user?.role === 'SELLER' && (
        <OpenCashRegisterModal
          sellerName={user.name}
          businessName={user.businessName}
          existingOpening={cashOpening || null}
          onSubmit={handleCreateOpening}
          onCancel={() => setShowOpeningModal(false)}
          requireOpening={requireCashOpening}
        />
      )}

      {/* Cash Register Closing Modal for Sellers */}
      {showClosingModal && user?.role === 'SELLER' && cashOpening && (
        <CloseCashRegisterModal
          sellerName={user.name}
          businessName={user.businessName}
          opening={cashOpening}
          todaySales={sales.filter(sale => {
            const today = new Date().toISOString().split('T')[0];
            const saleDate = sale.date.split('T')[0];
            return saleDate === today && sale.sellerId === user.id;
          })}
          onSubmit={handleCloseShift}
          onCancel={() => setShowClosingModal(false)}
        />
      )}

      {/* Closure Receipt Modal */}
      {closureReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-emerald-800">Cierre Completado</h3>
              <button
                onClick={() => setClosureReceipt(null)}
                className="text-emerald-600 hover:text-emerald-800 p-1"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6" id="closure-receipt-container">
              <CashClosureReceipt
                ref={closureReceiptRef}
                closure={closureReceipt}
                sellerName={user?.name || ''}
                businessName={user?.businessName}
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 flex-shrink-0">
              <button
                onClick={() => setClosureReceipt(null)}
                className="flex-1 btn-secondary py-3 text-sm sm:text-base"
              >
                Cerrar
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 btn-primary py-3 text-sm sm:text-base"
              >
                Imprimir Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      <Layout
        user={user}
        onLogout={handleLogout}
        onCloseShift={() => setShowClosingModal(true)}
        onReopenShift={user.role === 'SELLER' ? handleReopenShift : undefined}
        hasOpenedShift={!!cashOpening}
        hasClosedShift={!!cashClosure}
      >
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
