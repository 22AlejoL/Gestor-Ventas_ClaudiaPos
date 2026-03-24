import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data: q1, error: e1 } = await supabase.from('sales').select('id, seller:profiles(name), sale_items(id, product:products(name))').limit(1);
    console.log("Q1 Error:", e1);
    console.log("Q1 Data:", JSON.stringify(q1, null, 2));

    const { data: q2, error: e2 } = await supabase.from('sales').select('id, profiles(name), sale_items(id, products(name))').limit(1);
    console.log("Q2 Error:", e2);
    console.log("Q2 Data:", JSON.stringify(q2, null, 2));

    process.exit(0);
}
test();
