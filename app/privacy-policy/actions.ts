"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const file = formData.get("avatar") as File

  if (!file) {
    throw new Error("No file received")
  }

  const ext = file.name.split(".").pop()
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", user.id)

  if (updateError) {
    throw updateError
  }

  revalidatePath("/profile")
}
