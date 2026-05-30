import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('OAuth Callback Error:', error.message)
      let errorUrl = requestUrl.origin
      if (errorUrl.includes('0.0.0.0')) errorUrl = errorUrl.replace('0.0.0.0', 'localhost')
      return NextResponse.redirect(`${errorUrl}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // URL to redirect to after sign in process completes
  const next = requestUrl.searchParams.get('next')
  let redirectUrl = next ? `${requestUrl.origin}${next}` : requestUrl.origin
  // Fix for Windows dev environment where Next.js binds to 0.0.0.0
  if (redirectUrl.includes('0.0.0.0')) {
    redirectUrl = redirectUrl.replace('0.0.0.0', 'localhost')
  }
  return NextResponse.redirect(redirectUrl)
}
