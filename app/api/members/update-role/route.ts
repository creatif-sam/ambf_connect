import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
    const { memberId, newRole } = body

    if (!memberId || !newRole) {
      return NextResponse.json(
        { error: "Missing memberId or newRole" },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ["attendee", "speaker", "media", "organizer", "admin"]
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      )
    }

    // Get the membership to update
    const { data: targetMembership } = await supabase
      .from("event_members")
      .select("event_id, user_id")
      .eq("id", memberId)
      .single()

    if (!targetMembership) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Verify the current user is an organizer or admin of this event
    const { data: currentUserMembership } = await supabase
      .from("event_members")
      .select("role")
      .eq("event_id", targetMembership.event_id)
      .eq("user_id", user.id)
      .in("role", ["organizer", "admin"])
      .single()

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Only organizers or admins can update member roles" },
        { status: 403 }
      )
    }

    // Update the role
    console.log(`Updating member ${memberId} to role: ${newRole}`)
    
    const { data: updateData, error: updateError } = await supabase
      .from("event_members")
      .update({ role: newRole })
      .eq("id", memberId)
      .select()

    console.log("Update result:", { data: updateData, error: updateError })

    if (updateError) {
      console.error("Update error:", updateError)
      throw updateError
    }

    // Revalidate relevant paths
    revalidatePath(`/dashboard/events/${targetMembership.event_id}/members`)
    revalidatePath(`/dashboard/events/${targetMembership.event_id}`)
    revalidatePath("/dashboard/events")

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      updatedMember: updateData?.[0]
    })
  } catch (error) {
    console.error("Error updating member role:", error)
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    )
  }
}
