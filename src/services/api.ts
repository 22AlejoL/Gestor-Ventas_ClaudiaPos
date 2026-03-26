import { Product, Sale, Business } from '../types';
import { supabase } from '../lib/supabase';

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
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        return (data || []).map(p => ({
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
        const { data, error } = await supabase.from('sales').select('*, profiles(name), sale_items(*, products(name))');
        if (error) throw error;
        
        return (data || []).map(s => ({
            id: s.display_id,
            date: s.date,
            total: s.total,
            paymentMethod: s.payment_method,
            sellerId: s.seller_id,
            sellerName: s.profiles?.name,
            businessId: s.business_id,
            items: (s.sale_items || []).map((i: any) => ({
                productId: i.product_id,
                productName: i.products?.name || 'Agregado a sistema',
                quantity: i.quantity,
                price: i.price
            }))
        }));
    },

    async addSale(sale: Sale): Promise<Sale> {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, business_id')
            .eq('id', sale.sellerId)
            .single();

        if (profileError || !profile) {
            throw profileError || new Error('No se pudo cargar el perfil para registrar la venta.');
        }

        let businessId = sale.businessId || null;

        if (profile.role === 'OWNER') {
            if (!businessId) {
                throw new Error('Selecciona una empresa válida para registrar la venta.');
            }

            // Owner can sell only in businesses linked to them, including all their companies.
            const { data: ownerBusiness, error: ownerBusinessError } = await supabase
                .from('businesses')
                .select('id')
                .eq('id', businessId)
                .eq('owner_id', sale.sellerId)
                .maybeSingle();

            if (ownerBusinessError || !ownerBusiness) {
                throw ownerBusinessError || new Error('No tienes permiso para vender en esta empresa.');
            }
        } else if (profile.role === 'SELLER') {
            // Seller is bound to the company assigned in profile.
            businessId = profile.business_id;
        } else if (!businessId) {
            businessId = profile.business_id;
        }

        if (!businessId) {
            throw new Error('No se pudo determinar la empresa de la venta.');
        }

        const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert({
                display_id: sale.id,
                date: sale.date,
                total: sale.total,
                payment_method: sale.paymentMethod,
                seller_id: sale.sellerId,
                business_id: businessId
            })
            .select('id')
            .single();

        if (saleError) throw saleError;

        if (sale.items && sale.items.length > 0) {
            const items = sale.items.map((i: any) => ({
                sale_id: saleData.id,
                product_id: i.productId,
                quantity: i.quantity,
                price: i.price
            }));
            const { error: itemsError } = await supabase.from('sale_items').insert(items);
            if (itemsError) throw itemsError;

            // Deduct stock for each sold item and fail fast if user lacks permission.
            for (const item of sale.items) {
                const qty = item.quantity;
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('stock, is_unlimited, business_id')
                    .eq('id', item.productId)
                    .single();

                if (productError || !productData) {
                    throw productError || new Error('No se pudo validar el producto para descontar inventario.');
                }

                if (productData.business_id && productData.business_id !== businessId) {
                    throw new Error('El producto no pertenece a la empresa seleccionada.');
                }

                if (!productData.is_unlimited) {
                    const newStock = Math.max(0, productData.stock - qty);
                    let updateStockQuery = supabase
                        .from('products')
                        .update({ stock: newStock })
                        .eq('id', item.productId);

                    // Keep tenant-safety when the product is linked to a business,
                    // but still support legacy rows that don't have business_id.
                    if (productData.business_id) {
                        updateStockQuery = updateStockQuery.eq('business_id', businessId);
                    }

                    const { error: updateStockError } = await updateStockQuery;

                    if (updateStockError) {
                        throw updateStockError;
                    }
                }
            }
        }

        return {
            ...sale,
            businessId
        };
    }
};
