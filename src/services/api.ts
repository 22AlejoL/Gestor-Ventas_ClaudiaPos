import { Product, Sale } from '../types';
import { supabase } from '../lib/supabase';

export const api = {
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
        const { data, error } = await supabase.from('sales').select('*, sale_items(*)');
        if (error) throw error;
        
        return (data || []).map(s => ({
            id: s.display_id,
            date: s.date,
            total: s.total,
            paymentMethod: s.payment_method,
            sellerId: s.seller_id,
            businessId: s.business_id,
            items: (s.sale_items || []).map((i: any) => ({
                productId: i.product_id,
                quantity: i.quantity,
                price: i.price
            }))
        }));
    },

    async addSale(sale: Sale): Promise<Sale> {
        // Find a business ID for the seller (just pick the first available for now, since it wasn't tracked)
        let businessId = null;
        if (sale.sellerId) {
            const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', sale.sellerId).single();
            if (profile) businessId = profile.business_id;
        }

        const { data: saleData, error: saleError } = await supabase.from('sales').insert({
            display_id: sale.id, // e.g. "T-123123123"
            date: sale.date,
            total: sale.total,
            payment_method: sale.paymentMethod,
            seller_id: sale.sellerId,
            business_id: businessId
        }).select().single();

        if (saleError) throw saleError;

        if (sale.items && sale.items.length > 0) {
            const items = sale.items.map((i: any) => ({
                sale_id: saleData.id,
                product_id: i.productId,
                quantity: i.qty || i.quantity,
                price: i.price
            }));
            const { error: itemsError } = await supabase.from('sale_items').insert(items);
            if (itemsError) throw itemsError;
        }

        return sale;
    }
};
