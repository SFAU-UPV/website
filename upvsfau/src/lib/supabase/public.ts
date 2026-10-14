import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/supabase";
import { isSupabaseConfigured } from "@/src/lib/supabase/server";

export function createSupabasePublicClient() { if (!isSupabaseConfigured()) throw new Error("Supabase is not configured."); return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } }); }
