import { Product, Sale, Business, CashRegisterOpening, CashRegisterClosure } from '../types';
import { supabase } from '../lib/supabase';

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'supabase').toLowerCase();
const LOCAL_API_BASE = import.meta.env.VITE_LOCAL_API_BASE_URL ?? 'http://localhost:3001';

const useLocalApi = () => DATA_SOURCE === 'local';

// Helper functions for localStorage fallback
const getLocalStorageKey = (sellerId: string, date: string) => `cash_opening_${sellerId}_${date}`;
const getLocalStorageClosureKey = (sellerId: string, date: string) => `cash_closure_${sellerId}_${date}`;

const saveOpeningToLocalStorage = (opening: Omit<CashRegisterOpening, 'id' | 'createdAt'>): CashRegisterOpening => {
    const id = `local_${Date.now()}`;
    const newOpening: CashRegisterOpening = {
        ...opening,
        id,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem(getLocalStorageKey(opening.sellerId, opening.date), JSON.stringify(newOpening));
    return newOpening;
};

const getOpeningFromLocalStorage = (sellerId: string, date: string): CashRegisterOpening | null => {
    const data = localStorage.getItem(getLocalStorageKey(sellerId, date));
    return data ? JSON.parse(data) : null;
};

const saveClosureToLocalStorage = (closure: Omit<CashRegisterClosure, 'id' | 'createdAt'>): CashRegisterClosure => {
    const id = `local_${Date.now()}`;
    const newClosure: CashRegisterClosure = {
        ...closure,
        id,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem(getLocalStorageClosureKey(closure.sellerId, closure.date), JSON.stringify(newClosure));
    return newClosure;
};

const getClosureFromLocalStorage = (sellerId: string, date: string): CashRegisterClosure | null => {
    const data = localStorage.getItem(getLocalStorageClosureKey(sellerId, date));
    return data ? JSON.parse(data) : null;
};

const getErrorMessage = (error: unknown) => {
    if (!error) return 'Error desconocido al procesar la venta.';
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return String(error);
};

const getLocalJson = async <T>(path: string): Promise<T> => {
    const response = await fetch(`${LOCAL_API_BASE}${path}`);
    if (!response.ok) {
        throw new Error(`Local API GET failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
};

const postLocalJson = async (path: string, body: unknown): Promise<void> => {
    const response = await fetch(`${LOCAL_API_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error(`Local API POST failed: ${response.status}`);
    }
};

type ProductRow = {
    id: string;
    name: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    min_stock: number;
    image?: string;
    is_unlimited?: boolean;
    business_id?: string;
};

type SaleItemRow = {
    product_id: string;
    quantity: number;
    price: number;
    products?: {
        name?: string;
    };
};

type SaleRow = {
    id: string;
    display_id: string;
    date: string;
    total: number;
    payment_method: 'CASH' | 'CARD' | 'DIGITAL';
    seller_id: string;
    business_id?: string;
    profiles?: {
        name?: string;
    };
    sale_items?: SaleItemRow[];
};

type ProfileRoleRow = {
    id: string;
    role: 'SELLER' | 'OWNER' | 'SUPER_ADMIN';
    business_id?: string;
};

export const api = {
    async getBusiness(id: string): Promise<Business | null> {
        try {
            const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();
            if (error) throw error;
            return {
                id: data.id,
                name: data.name,
                ownerId: data.owner_id,
                status: data.status
            };
        } catch (e) {
            console.error('Error fetching business:', e);
            const mock = await import('../data/mock');
            return mock.MOCK_BUSINESSES.find(b => b.id === id) || null;
        }
    },

    async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
        const { data, error } = await supabase.from('businesses').select('*').eq('owner_id', ownerId).eq('status', 'ACTIVE');
        if (error) throw error;
        return (data || []).map(b => ({
            id: b.id,
            name: b.name,
            ownerId: b.owner_id,
            status: b.status
        }));
    },

    async getProducts(): Promise<Product[]> {
        if (useLocalApi()) {
            return getLocalJson<Product[]>('/api/products');
        }

        const { data, error } = await supabase.from('products').select('*').returns<ProductRow[]>();
        if (error) throw error;
        
        return (data || []).map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            cost: p.cost,
            stock: p.stock,
            minStock: p.min_stock,
            image: p.image,
            isUnlimited: p.is_unlimited,
            businessId: p.business_id
        }));
    },

    async updateProducts(products: Product[]): Promise<void> {
        if (!products.length) return;

        if (useLocalApi()) {
            await postLocalJson('/api/products', products);
            return;
        }

        const rows = products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            cost: p.cost,
            stock: p.stock,
            min_stock: p.minStock,
            image: p.image,
            is_unlimited: p.isUnlimited,
            business_id: p.businessId
        }));
        
        const { error } = await supabase.from('products').upsert(rows);
        if (error) throw error;
    },

    async getSales(): Promise<Sale[]> {
        if (useLocalApi()) {
            return getLocalJson<Sale[]>('/api/sales');
        }

        const { data, error } = await supabase
            .from('sales')
            .select('*, profiles(name), sale_items(*, products(name))')
            .returns<SaleRow[]>();
        if (error) throw error;
        
        return (data || []).map((s) => ({
            id: s.display_id,
            date: s.date,
            total: s.total,
            paymentMethod: s.payment_method,
            sellerId: s.seller_id,
            sellerName: s.profiles?.name,
            businessId: s.business_id,
            items: (s.sale_items || []).map((i) => ({
                productId: i.product_id,
                productName: i.products?.name || 'Agregado a sistema',
                quantity: i.quantity,
                price: i.price
            }))
        }));
    },

    async addSale(sale: Sale): Promise<Sale> {
        if (useLocalApi()) {
            if (!sale.businessId) {
                throw new Error('businessId es obligatorio para registrar ventas.');
            }

            const currentProducts = await getLocalJson<Product[]>('/api/products');
            const stockAdjusted = currentProducts.map((product) => {
                const soldItem = sale.items.find((item) => item.productId === product.id);
                if (!soldItem || product.isUnlimited) {
                    return product;
                }

                return {
                    ...product,
                    stock: Math.max(0, product.stock - soldItem.quantity)
                };
            });

            await postLocalJson('/api/products', stockAdjusted);
            await postLocalJson('/api/sales', sale);
            return sale;
        }

        if (!sale.sellerId) {
            throw new Error('sellerId es obligatorio para registrar ventas.');
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, business_id')
            .eq('id', sale.sellerId)
            .single<ProfileRoleRow>();

        if (profileError || !profile) {
            throw new Error('No se pudo validar el perfil del usuario que registra la venta.');
        }

        const finalBusinessId = sale.businessId ?? profile.business_id;
        if (!finalBusinessId) {
            throw new Error('Debes seleccionar una empresa para registrar la venta.');
        }

        if (profile.role === 'SELLER' && profile.business_id && profile.business_id !== finalBusinessId) {
            throw new Error('El vendedor no puede registrar ventas para una empresa diferente a la asignada.');
        }

        if (profile.role === 'OWNER') {
            const { data: ownedBusiness, error: ownedBusinessError } = await supabase
                .from('businesses')
                .select('id')
                .eq('id', finalBusinessId)
                .eq('owner_id', profile.id)
                .maybeSingle();

            const ownerHasBusinessByProfile = profile.business_id === finalBusinessId;
            if (ownedBusinessError || (!ownedBusiness && !ownerHasBusinessByProfile)) {
                throw new Error('La empresa seleccionada no pertenece al dueño que registra la venta.');
            }
        }

        const { data: saleData, error: saleError } = await supabase.from('sales').insert({
            display_id: sale.id, // e.g. "T-123123123"
            date: sale.date,
            total: sale.total,
            payment_method: sale.paymentMethod,
            seller_id: sale.sellerId,
            business_id: finalBusinessId
        }).select().single();

        if (saleError) throw new Error(getErrorMessage(saleError));

        if (sale.items && sale.items.length > 0) {
            const items = sale.items.map((i) => ({
                sale_id: saleData.id,
                product_id: i.productId,
                quantity: i.quantity,
                price: i.price
            }));
            const { error: itemsError } = await supabase.from('sale_items').insert(items);
            if (itemsError) throw new Error(getErrorMessage(itemsError));

            // Deduct stock for each sold item
            for (const item of sale.items) {
                const qty = item.quantity;
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('stock, is_unlimited, business_id')
                    .eq('id', item.productId)
                    .single();

                if (!productError && productData && productData.business_id && productData.business_id !== finalBusinessId) {
                    throw new Error('La venta incluye productos de una empresa diferente a la seleccionada.');
                }

                if (!productError && productData && !productData.is_unlimited) {
                    const newStock = Math.max(0, productData.stock - qty);
                    const { error: stockError } = await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
                    if (stockError) throw new Error(getErrorMessage(stockError));
                }
            }
        }

        return sale;
    },

    // Cash Register Operations
    async getTodayOpening(sellerId: string, businessId?: string): Promise<CashRegisterOpening | null> {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const { data, error } = await supabase
                .from('cash_register_openings')
                .select('*')
                .eq('seller_id', sellerId)
                .eq('date', today)
                .maybeSingle();
            
            if (data) {
                return {
                    id: data.id,
                    sellerId: data.seller_id,
                    sellerName: data.seller_name,
                    businessId: data.business_id,
                    date: data.date,
                    initialAmount: data.initial_amount,
                    createdAt: data.created_at
                };
            }
        } catch (err) {
            console.log('Supabase error, falling back to localStorage');
        }
        
        // Fallback to localStorage
        return getOpeningFromLocalStorage(sellerId, today);
    },

    async createOpening(opening: Omit<CashRegisterOpening, 'id' | 'createdAt'>): Promise<CashRegisterOpening> {
        try {
            const { data, error } = await supabase
                .from('cash_register_openings')
                .insert({
                    seller_id: opening.sellerId,
                    seller_name: opening.sellerName,
                    business_id: opening.businessId,
                    date: opening.date,
                    initial_amount: opening.initialAmount
                })
                .select()
                .single();
            
            if (error) {
                // If table doesn't exist or schema cache error, fall back to localStorage
                if (error.message?.includes('does not exist') || 
                    error.message?.includes('schema cache') ||
                    error.code === '42P01' || 
                    error.code === 'PGRST116') {
                    console.log('Table not found in Supabase, using localStorage fallback');
                    return saveOpeningToLocalStorage(opening);
                }
                throw new Error(getErrorMessage(error));
            }
            
            // Also save to localStorage as backup
            saveOpeningToLocalStorage(opening);
            
            return {
                id: data.id,
                sellerId: data.seller_id,
                sellerName: data.seller_name,
                businessId: data.business_id,
                date: data.date,
                initialAmount: data.initial_amount,
                createdAt: data.created_at
            };
        } catch (err: any) {
            // If any error occurs, try localStorage fallback silently
            console.log('Supabase error, using localStorage fallback:', err?.message);
            return saveOpeningToLocalStorage(opening);
        }
    },

    async createClosure(closure: Omit<CashRegisterClosure, 'id' | 'createdAt'>): Promise<CashRegisterClosure> {
        try {
            const { data, error } = await supabase
                .from('cash_register_closures')
                .insert({
                    seller_id: closure.sellerId,
                    seller_name: closure.sellerName,
                    business_id: closure.businessId,
                    date: closure.date,
                    opening_id: closure.openingId,
                    initial_amount: closure.initialAmount,
                    final_amount: closure.finalAmount,
                    expenses: closure.expenses,
                    expenses_details: closure.expensesDetails,
                    difference: closure.difference,
                    payment_breakdown: closure.paymentBreakdown,
                    total_sales: closure.totalSales
                })
                .select()
                .single();
            
            if (error) {
                // If table doesn't exist or schema cache error, fall back to localStorage
                if (error.message?.includes('does not exist') || 
                    error.message?.includes('schema cache') ||
                    error.code === '42P01' || 
                    error.code === 'PGRST116') {
                    console.log('Table not found in Supabase, using localStorage fallback');
                    return saveClosureToLocalStorage(closure);
                }
                throw new Error(getErrorMessage(error));
            }
            
            // Also save to localStorage as backup
            saveClosureToLocalStorage(closure);
            
            return {
                id: data.id,
                sellerId: data.seller_id,
                sellerName: data.seller_name,
                businessId: data.business_id,
                date: data.date,
                openingId: data.opening_id,
                initialAmount: data.initial_amount,
                finalAmount: data.final_amount,
                expenses: data.expenses,
                expensesDetails: data.expenses_details,
                difference: data.difference,
                paymentBreakdown: data.payment_breakdown,
                totalSales: data.total_sales,
                createdAt: data.created_at
            };
        } catch (err: any) {
            // If any error occurs, try localStorage fallback silently
            console.log('Supabase error, using localStorage fallback:', err?.message);
            return saveClosureToLocalStorage(closure);
        }
    },

    async getTodayClosure(sellerId: string): Promise<CashRegisterClosure | null> {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const { data, error } = await supabase
                .from('cash_register_closures')
                .select('*')
                .eq('seller_id', sellerId)
                .eq('date', today)
                .maybeSingle();
            
            if (data) {
                return {
                    id: data.id,
                    sellerId: data.seller_id,
                    sellerName: data.seller_name,
                    businessId: data.business_id,
                    date: data.date,
                    openingId: data.opening_id,
                    initialAmount: data.initial_amount,
                    finalAmount: data.final_amount,
                    expenses: data.expenses,
                    expensesDetails: data.expenses_details,
                    difference: data.difference,
                    paymentBreakdown: data.payment_breakdown,
                    totalSales: data.total_sales,
                    createdAt: data.created_at
                };
            }
        } catch (err) {
            console.log('Supabase error, falling back to localStorage');
        }
        
        // Fallback to localStorage
        return getClosureFromLocalStorage(sellerId, today);
    }
};
