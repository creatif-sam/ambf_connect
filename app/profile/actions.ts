"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/* =========================
   UPDATE PROFILE INFO
   ========================= */

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name"),
      job_title: formData.get("job_title"),
      company: formData.get("company")
    })
    .eq("id", user.id)

  revalidatePath("/profile")
}

/* =========================
   UPDATE AVATAR URL
   ========================= */

export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  await supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl
    })
    .eq("id", user.id)

  revalidatePath("/profile")
}

/* =========================
   LOGOUT
   ========================= */

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
}
