import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * READ ONLY SERVER CLIENT
 * Safe for Server Components
 * Does not mutate cookies
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set() {
        /* noop on purpose */
      },
      remove() {
        /* noop on purpose */
      }
    }
  })
}

/**
 * MUTABLE SERVER CLIENT
 * ONLY for Server Actions or Route Handlers
 * Allows cookie mutation
 */
export async function createSupabaseActionClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      }
    }
  })
}
