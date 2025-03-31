import { createClient } from '@supabase/supabase-js'; 
// database connection script to supabase servers 
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANNON_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey); 

export default supabase; 
