"use client"

import { useState, useTransition, useRef } from "react"
import ProfileToast from "@/components/ProfileToast"
import ConferenceCard from "@/components/ConferenceCard"
import ProfileCompleteness from "@/components/ProfileCompleteness"
import { LogOut, Pencil, CreditCard, Camera } from "lucide-react"
import { updateProfile, logoutAction, updateAvatarUrl } from "./actions"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type ProfileClientProps = {
  profile: any
  email: string
  totalConnections: number
  pendingConnections: number
}

export default function ProfileClient({
  profile,
  email,
  totalConnections,
  pendingConnections
}: ProfileClientProps) {
  const [toast, setToast] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [pending, startTransition] = useTransition()
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingPhoto(true)

      const supabase = createSupabaseBrowserClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const fileExt = file.name.split(".").pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl }
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      await updateAvatarUrl(publicUrl)
      setToast("Profile photo updated")
      window.location.reload()
    } catch (err: any) {
      setToast(err.message ?? "Upload failed")
    } finally {
      setUploadingPhoto(false)
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateProfile(formData)
      setEditing(false)
      setToast("Profile updated successfully")
    })
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
      window.location.href = "/auth/login"
    })
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8 space-y-8">

      {toast && (
        <ProfileToast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}

      {showCard && (
        <ConferenceCard
          profile={profile}
          onClose={() => setShowCard(false)}
        />
      )}

      {/* Profile header */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="h-28 w-28 rounded-full bg-gray-200 overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-3xl font-semibold text-gray-500">
                {profile?.full_name?.charAt(0) ?? "?"}
              </div>
            )}
          </div>
          
          {/* Camera overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute inset-0 h-28 w-28 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
          
          {uploadingPhoto && (
            <div className="absolute inset-0 h-28 w-28 rounded-full bg-black/70 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        <div>
          <p className="text-xl font-semibold">
            {profile?.full_name || "Unnamed user"}
          </p>
          <p className="text-sm text-gray-500">
            {profile?.job_title || email}
          </p>
          <p className="text-sm text-gray-500">
            {profile?.company}
          </p>
          {profile?.sector_of_activity && (
            <p className="text-sm text-gray-600 mt-1">
              {profile.sector_of_activity}
            </p>
          )}
          {profile?.country && (
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
              <span>📍</span> {profile.country}
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-around text-center border rounded-xl py-4 bg-white">
        <div>
          <p className="text-lg font-semibold">
            {totalConnections}
          </p>
          <p className="text-xs text-gray-500">
            Connections
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold">
            {pendingConnections}
          </p>
          <p className="text-xs text-gray-500">
            Pending
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold">
            0
          </p>
          <p className="text-xs text-gray-500">
            Events
          </p>
        </div>
      </section>

      {/* Profile Completeness */}
      <ProfileCompleteness profile={profile} />

      {/* Avatar upload - old component removed, now using overlay */}

      {/* Conference Badge Button */}
      <button
        onClick={() => setShowCard(true)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c1d1d] to-[#d4af37] text-white font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
      >
        <CreditCard size={20} />
        View Conference Badge
      </button>

      {/* Bio Section */}
      {!editing && profile?.bio && (
        <section className="border rounded-xl p-6 bg-white space-y-2">
          <p className="font-medium">
            Bio
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {profile.bio}
          </p>
        </section>
      )}

      {/* Edit profile */}
      <section className="border rounded-xl p-6 bg-white space-y-4">
        <div className="flex justify-between items-center">
          <p className="font-medium">
            Profile information
          </p>
          <button
            type="button"
            onClick={() => setEditing(v => !v)}
            className="flex items-center gap-1 text-sm text-gray-600"
          >
            <Pencil size={14} />
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing && (
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Full name
              </label>
              <input
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Job title
              </label>
              <input
                name="job_title"
                defaultValue={profile?.job_title ?? ""}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Company
              </label>
              <input
                name="company"
                defaultValue={profile?.company ?? ""}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Sector of Activity
              </label>
              <input
                name="sector_of_activity"
                defaultValue={profile?.sector_of_activity ?? ""}
                placeholder="e.g., Healthcare, Technology, Finance"
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Country
              </label>
              <input
                name="country"
                defaultValue={profile?.country ?? ""}
                placeholder="Your country"
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Bio <span className="text-xs text-gray-500">(max 100 words)</span>
              </label>
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ""}
                rows={4}
                maxLength={800}
                placeholder="Tell us about yourself..."
                className="mt-1 w-full border rounded-md px-3 py-2 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {profile?.bio ? profile.bio.trim().split(/\s+/).length : 0} / 100 words
              </p>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-lg bg-black text-white font-medium disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </section>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
      >
        <LogOut size={18} />
        Log out
      </button>

    </main>
  )
}
