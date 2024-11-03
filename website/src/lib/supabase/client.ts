import { createClient } from '@supabase/supabase-js';

import { SUPABASE_KEY, SUPABASE_URL } from '$env/static/private';

import type { Database } from './database.types';

export default createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
