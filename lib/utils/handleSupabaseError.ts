export function handleSupabaseError(error: any): never {
  if (!error) {
    throw new Error("Unknown Supabase error")
  }

  if (typeof error === "string") {
    throw new Error(error)
  }

  if (error.message) {
    throw new Error(error.message)
  }

  throw new Error(JSON.stringify(error))
}
