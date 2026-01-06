import { createClient } from "supabase"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

Deno.serve(async (req) => {
  try {
    const { userId, userEmail, userName } = await req.json()

    if (!userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Send email using Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "AMBF Connect <notifications@ambfconnect.com>",
        to: [userEmail],
        subject: `Welcome to AMBF Connect - Your account has been approved!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to AMBF Connect!</h1>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-top: 0;">Hi ${userName || "there"},</p>
                
                <p style="font-size: 16px;">
                  Great news! Your AMBF Connect account has been approved. You now have full access to the platform.
                </p>
                
                <p style="font-size: 16px;">
                  Here's what you can do now:
                </p>
                
                <ul style="font-size: 16px; color: #555;">
                  <li>Browse and join upcoming events</li>
                  <li>Connect with other professionals in your field</li>
                  <li>Access event agendas and session details</li>
                  <li>Network with attendees through direct messaging</li>
                  <li>Stay updated with real-time announcements</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${Deno.env.get("NEXT_PUBLIC_APP_URL") || "http://localhost:3000"}/events" 
                     style="display: inline-block; background: #000000; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Explore Events
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-bottom: 0;">
                  Welcome aboard!<br>
                  The AMBF Connect Team
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>© 2026 AMBF Connect. All rights reserved.</p>
              </div>
            </body>
          </html>
        `
      })
    })

    if (!emailRes.ok) {
      const error = await emailRes.text()
      console.error("Resend API error:", error)
      throw new Error(`Failed to send email: ${error}`)
    }

    const result = await emailRes.json()

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error sending approval email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
