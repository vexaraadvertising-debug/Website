import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  console.log(`[MIDDLEWARE_AUTH] Request Path: ${pathname} | User ID: ${user?.id || 'UNAUTHENTICATED'}`);

  // 1. General Protected Routes (Requires Login)
  const protectedRoutes = ['/account', '/orders', '/wishlist', '/cart', '/checkout']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    console.log(`[MIDDLEWARE_AUTH] Protected route access denied for ${pathname}. Redirecting to /login`);
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Admin Routes Protection
  if (pathname.startsWith('/admin')) {
    const isAdminRoute = !pathname.startsWith('/admin/login');
    
    if (!user) {
      if (isAdminRoute) {
        console.log(`[MIDDLEWARE_AUTH] Admin route access denied for ${pathname} (No user session). Redirecting to /admin/login`);
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
      // If they are on /admin/login and not logged in, let them stay.
      return supabaseResponse;
    }

    const email = user.email?.toLowerCase()
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || 'admin@orinko.in'
    const isEmailAdmin = email ? (email === adminEmail || email.endsWith('@orinko.in')) : false

    const rawMetaRole = user.user_metadata?.role || user.app_metadata?.role
    const metaRole = rawMetaRole ? String(rawMetaRole).toLowerCase() : null
    const isMetaAdmin = metaRole === 'admin' || metaRole === 'super_admin'

    let profileRole: string | null = null
    let isProfileAdmin = false
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.warn(`[MIDDLEWARE_AUTH] Profile fetch error for ${user.id}:`, error.message)
      } else if (profile?.role) {
        profileRole = String(profile.role).toLowerCase()
        if (profileRole === 'admin' || profileRole === 'super_admin') {
          isProfileAdmin = true
        }
      }
    } catch (err) {
      console.warn(`[MIDDLEWARE_AUTH] Exception querying profiles in middleware:`, err)
    }

    const isAdmin = isEmailAdmin || isMetaAdmin || isProfileAdmin

    console.log(`[MIDDLEWARE_AUTH] Admin check for ${pathname}:`, {
      userId: user.id,
      email,
      isAdmin
    })

    if (!isAdmin) {
      console.warn(`[MIDDLEWARE_AUTH] User ${user.email} is not authorized for /admin. Redirecting to /`);
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    } else if (pathname === '/admin/login') {
      // If user is already an admin and tries to go to login, redirect to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

