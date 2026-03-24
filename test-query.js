import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data: sales, error } = await supabase.from('sales').select('*, profiles(name), sale_items(*, products(name))').limit(2);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Sales with default table joins:", JSON.stringify(sales, null, 2));
    }
}
test();
