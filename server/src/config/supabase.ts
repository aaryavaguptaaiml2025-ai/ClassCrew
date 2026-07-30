import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase URL / Service Role Key not set in environment. Database queries will require valid credentials in server/.env');
}

// Paste these two lines here
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SERVICE KEY EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;