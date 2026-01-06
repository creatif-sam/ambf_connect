import { createSupabaseServerClient } from "@/lib/supabase/server"
import EventsClient from "./EventsClient"

export default async function EventsPage() {
  const supabase = await createSupabaseServerClient()

  // Check if user is authenticated
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, slug, start_date, end_date")
    .order("start_date", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  // If authenticated, check which events user has joined
  let eventsWithJoinStatus = events || []
  
  if (user) {
    const { data: memberships } = await supabase
      .from("event_members")
      .select("event_id")
      .eq("user_id", user.id)

    const joinedEventIds = new Set(memberships?.map(m => m.event_id) || [])

    eventsWithJoinStatus = events?.map(event => ({
      ...event,
      is_joined: joinedEventIds.has(event.id)
    })) || []
  }

  return (
    <EventsClient 
      events={eventsWithJoinStatus} 
      isAuthenticated={!!user}
    />
  )
}
