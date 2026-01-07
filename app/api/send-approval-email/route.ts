import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function POST(req: NextRequest) {
  try {
    console.log("[send-approval-email] Starting email send process...")
    console.log("[send-approval-email] Environment check:", {
      hasResendKey: !!RESEND_API_KEY,
      hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    })
    
    const { userEmail, userName } = await req.json()
    console.log("[send-approval-email] Request body:", { userEmail, userName })

    if (!userEmail) {
      console.error("[send-approval-email] Missing userEmail in request")
      return NextResponse.json(
        { error: "Missing userEmail" },
        { status: 400 }
      )
    }

    if (!RESEND_API_KEY) {
      console.error("[send-approval-email] RESEND_API_KEY not configured")
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured in environment. Please add it to Vercel environment variables." },
        { status: 500 }
      )
    }

    // Send email using Resend
    console.log("[send-approval-email] Calling Resend API...")
    const emailPayload = {
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [userEmail],
    }
    console.log("[send-approval-email] Email payload:", emailPayload)
    
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: emailPayload.from,
        to: emailPayload.to,
        subject: "Welcome to Africamed Connect - Your account has been approved!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to Africamed Connect!</h1>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-top: 0;">Hi ${userName || "there"},</p>
                
                <p style="font-size: 16px;">
                  Great news! Your Africamed Connect account has been approved. You now have full access to the African and Mediterranean business forum platform organized by Kardev.
                </p>
                
                <p style="font-size: 16px;">
                  Here's what you can do now:
                </p>
                
                <ul style="font-size: 16px; color: #555;">
                  <li>Browse and join upcoming events</li>
                  <li>Connect with business leaders and professionals</li>
                  <li>Access event agendas and session details</li>
                  <li>Network with attendees through direct messaging</li>
                  <li>Stay updated with real-time announcements</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/events" 
                     style="display: inline-block; background: #000000; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Explore Events
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-bottom: 0;">
                  Welcome aboard!<br>
                  The Africamed Connect Team
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>© 2026 Africamed Connect. All rights reserved.</p>
                <p style="margin-top: 5px;">Need help? Contact <a href="mailto:it-support@africamedforum.com" style="color: #666;">it-support@africamedforum.com</a></p>
              </div>
            </body>
          </html>
        `
      })
    })

    console.log("[send-approval-email] Resend API response status:", emailRes.status)
    
    if (!emailRes.ok) {
      let error
      try {
        const jsonError = await emailRes.json()
        error = JSON.stringify(jsonError)
        console.error("[send-approval-email] Resend API JSON error:", jsonError)
      } catch {
        error = await emailRes.text()
        console.error("[send-approval-email] Resend API text error:", error)
      }
      console.error("[send-approval-email] Resend API failed with status:", emailRes.status)
      return NextResponse.json(
        { 
          error: `Failed to send email via Resend API (${emailRes.status}): ${error}`,
          details: {
            status: emailRes.status,
            resendError: error,
            timestamp: new Date().toISOString()
          }
        },
        { status: emailRes.status }
      )
    }

    const result = await emailRes.json()
    console.log("[send-approval-email] Email sent successfully!", { emailId: result.id })

    return NextResponse.json({
      success: true,
      emailId: result.id
    })
  } catch (error) {
    console.error("[send-approval-email] Unexpected error:", error)
    console.error("[send-approval-email] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          type: error instanceof Error ? error.constructor.name : typeof error,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}
