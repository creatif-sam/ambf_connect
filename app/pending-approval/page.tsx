import { redirect } from "next/navigation"
import { Clock, Mail } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function PendingApprovalPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, status")
    .eq("id", user.id)
    .single()

  // If user is approved, redirect to home
  if (profile?.status === "approved") {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              Account Pending Approval
            </h1>
            <p className="text-zinc-600">
              Thank you for registering, {profile?.full_name || "there"}!
            </p>
          </div>

          {/* Message */}
          <div className="bg-zinc-50 rounded-lg p-4 text-left space-y-3">
            <p className="text-sm text-zinc-700">
              Your account is currently under review by our team. You'll receive
              an email at <strong>{profile?.email}</strong> once your account has
              been approved.
            </p>
            <p className="text-sm text-zinc-700">
              This usually takes 24-48 hours. We appreciate your patience!
            </p>
          </div>

          {/* Email Icon */}
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
            <Mail className="h-4 w-4" />
            <span>Check your email for updates</span>
          </div>

          {/* Logout Button */}
          <form action="/auth/logout" method="post" className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          Questions? Contact us at{" "}
          <a
            href="mailto:support@ambfconnect.com"
            className="text-zinc-700 hover:underline"
          >
            support@ambfconnect.com
          </a>
        </p>
      </div>
    </div>
  )
}
