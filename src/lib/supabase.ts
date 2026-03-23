import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbjwuvhxdxbzozyuwogi.supabase.co';
const supabaseKey = 'sb_publishable_KaB1Qo3eupBE9JIt_tVukA_x7CzmvC-';

export const supabase = createClient(supabaseUrl, supabaseKey);
