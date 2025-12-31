import { createSupabaseBrowserClient } from "./client"

export async function signIn(email: string, password: string) {
  const supabase = createSupabaseBrowserClient()

  return supabase.auth.signInWithPassword({
    email,
    password
  })
}

export async function signUp(email: string, password: string) {
  const supabase = createSupabaseBrowserClient()

  return supabase.auth.signUp({
    email,
    password
  })
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient()

  return supabase.auth.signOut()
}
