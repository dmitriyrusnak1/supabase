import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
