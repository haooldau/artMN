// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'postgres://hao98:ch763164982*@101.132.80.183:5433/db9f0bebc54a064ba09d6d93734dfa6331stardata';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.secret'; // 这里需要替换为实际的 anon key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;