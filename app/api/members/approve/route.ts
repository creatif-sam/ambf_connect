import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { throwServerError } from "@/lib/utils/throwServerError"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing userId or action" },
        { status: 400 }
      )
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    // Verify the current user is an organizer
    const { data: membership, error: membershipError } = await supabase
      .from("event_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "organizer")
      .limit(1)
      .single()

    console.log("Organizer check for user:", user.id)
    console.log("Membership data:", membership)
    console.log("Membership error:", membershipError)

    if (!membership) {
      // Check if user has any event_member record at all
      const { data: anyMembership } = await supabase
        .from("event_members")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .single()

      console.log("Any membership found:", anyMembership)

      return NextResponse.json(
        { 
          error: "Only organizers can approve users. Please ensure you are added as an organizer in at least one event.",
          debug: {
            userId: user.id,
            hasMembership: !!anyMembership,
            role: anyMembership?.role
          }
        },
        { status: 403 }
      )
    }

    // Get the user profile details
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, full_name, email, status")
      .eq("id", userId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify the user is pending
    if (profile.status !== "pending") {
      return NextResponse.json(
        { error: "User is not pending approval" },
        { status: 400 }
      )
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    console.log(`Updating user ${userId} status from ${profile.status} to ${newStatus}`)

    // Create admin client with service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Update the user status using admin client
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", userId)
      .select()

    if (updateError) {
      console.error("Update error:", updateError)
      throwServerError(updateError)
    }

    console.log("Update successful:", updateData)

    // Verify the update
    const { data: verifyProfile } = await supabaseAdmin
      .from("profiles")
      .select("status")
      .eq("id", userId)
      .single()

    console.log("Verified status after update:", verifyProfile?.status)

    // Revalidate the dashboard to update the pending users list
    revalidatePath("/dashboard")

    // If approved, send email notification
    if (action === "approve" && profile.email) {
      try {
        // Determine the base URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                       (req.headers.get('origin') || 
                       `http://localhost:${process.env.PORT || 3000}`)
        
        console.log("Attempting to send approval email to:", profile.email)
        console.log("Using base URL:", baseUrl)
        
        const emailResponse = await fetch(`${baseUrl}/api/send-approval-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userEmail: profile.email,
            userName: profile.full_name
          })
        })

        let emailResult
        try {
          const contentType = emailResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            emailResult = await emailResponse.json()
          } else {
            const textResponse = await emailResponse.text()
            console.error("Non-JSON response from email API:", textResponse)
            emailResult = { error: textResponse.substring(0, 500) } // Limit error message length
          }
        } catch (e) {
          console.error("Failed to parse email response:", e)
          emailResult = { error: "Failed to parse response" }
        }
        
        console.log("Email API response status:", emailResponse.status)
        console.log("Email API response body:", emailResult)

        if (!emailResponse.ok) {
          const errorMsg = emailResult.error || `HTTP ${emailResponse.status}: ${emailResponse.statusText}`
          console.error("Failed to send email:", errorMsg)
          return NextResponse.json({
            success: true,
            status: newStatus,
            emailSent: false,
            emailError: errorMsg
          })
        }

        console.log("Approval email sent successfully")
        return NextResponse.json({
          success: true,
          status: newStatus,
          emailSent: true
        })
      } catch (emailError) {
        console.error("Email sending error:", emailError)
        return NextResponse.json({
          success: true,
          status: newStatus,
          emailSent: false,
          emailError: emailError instanceof Error ? emailError.message : "Unknown error"
        })
      }
    }

    return NextResponse.json({
      success: true,
      status: newStatus
    })
  } catch (error) {
    console.error("Error handling user approval:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
