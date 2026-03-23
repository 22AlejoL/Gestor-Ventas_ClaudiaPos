import { Product, Sale } from '../types';

const API_BASE = '/api';

export const api = {
    async getProducts(): Promise<Product[]> {
        const res = await fetch(`${API_BASE}/products`);
        return res.json();
    },

    async updateProducts(products: Product[]): Promise<void> {
        await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(products),
        });
    },

    async getSales(): Promise<Sale[]> {
        const res = await fetch(`${API_BASE}/sales`);
        return res.json();
    },

    async addSale(sale: Sale): Promise<Sale> {
        const res = await fetch(`${API_BASE}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sale),
        });
        return res.json();
    }
};
