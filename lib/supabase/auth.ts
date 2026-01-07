import { createSupabaseBrowserClient } from "./client"

export async function signIn(email: string, password: string) {
  const supabase = createSupabaseBrowserClient()

  return supabase.auth.signInWithPassword({
    email,
    password
  })
}

export async function signUp(
  email: string,
  password: string,
  profile?: {
    full_name?: string
    job_title?: string
    company?: string
    id_passport_cin?: string
    enterprise_website?: string
    sector_of_activity?: string
    country?: string
  }
) {
  const supabase = createSupabaseBrowserClient()

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: profile || {}
    }
  })
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient()

  return supabase.auth.signOut()
}
