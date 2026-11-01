import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ldneaieojkrbyczbmwit.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hCZjftpeQSqA_cw0u7dY1w_c751_CfY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);