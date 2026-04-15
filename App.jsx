import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyijoveheyznubkyool.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWlqb3ZlaGV5em51Ymt5b29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NzIzNzcsImV4cCI6MjA1MzE0ODM3N30.kSEmBJOspFST_gVQasBGSXxMskFXBIcmsP9jBJsfLw0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
