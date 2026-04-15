import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyijoveheyznubkyool.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JW72QkTRQIi_oiMV_w2rKw_R6nA-F8D';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
