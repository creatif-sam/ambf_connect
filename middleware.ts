import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  // If user is logged in, check their status
  if (user) {
    try {
      // Fetch profile with no cache to ensure fresh data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Profile fetch error:", error)
      }

      // If user is pending and trying to access protected routes, redirect to pending page
      if (
        profile?.status === "pending" &&
        !request.nextUrl.pathname.startsWith("/auth") &&
        !request.nextUrl.pathname.startsWith("/api") &&
        request.nextUrl.pathname !== "/pending-approval"
      ) {
        return NextResponse.redirect(
          new URL("/pending-approval", request.url)
        )
      }

      // If user is approved and trying to access pending page, redirect to home
      if (
        profile?.status === "approved" &&
        request.nextUrl.pathname === "/pending-approval"
      ) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      // If user is rejected, redirect to login
      if (
        profile?.status === "rejected" &&
        !request.nextUrl.pathname.startsWith("/auth")
      ) {
        // Clear session and redirect to login
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    } catch (error) {
      // If status column doesn't exist yet, allow access (migration not run)
      console.log("Status check skipped:", error)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}
