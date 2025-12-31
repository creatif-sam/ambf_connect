"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadAvatar(formData: FormData) {
  const file = formData.get("avatar") as File | null
  if (!file) return

  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const fileExt = file.name.split(".").pop()
  const filePath = `${user.id}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true
    })

  if (uploadError) throw uploadError

  const {
    data: { publicUrl }
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath)

  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)

  revalidatePath("/profile")
}
