import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push@3.6.7"

/* 🔐 ENV VARS (Edge-safe names) */
const SUPABASE_URL = Deno.env.get("URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!

/* 🔔 Configure VAPID */
webpush.setVapidDetails(
  "mailto:support@ambfconnect.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

/* 🔑 Supabase admin client */
const supabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY
)

export default async (req: Request) => {
  try {
    const { receiverId, senderName, message, url } = await req.json()

    if (!receiverId || !message) {
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400 }
      )
    }

    /* 1️⃣ Fetch push subscriptions */
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", receiverId)

    if (error) throw error
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, skipped: "no subscriptions" }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    /* 2️⃣ JSON payload REQUIRED by service worker */
    const payload = JSON.stringify({
      title: senderName ?? "New message",
      body: message,
      url: url ?? "/messages"
    })

    /* 3️⃣ Send push to ALL devices */
    await Promise.all(
      subscriptions.map(sub =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        )
      )
    )

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Push failed:", err)

    return new Response(
      JSON.stringify({ error: "Push failed" }),
      { status: 500 }
    )
  }
}
