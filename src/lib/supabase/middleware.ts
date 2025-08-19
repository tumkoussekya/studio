
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['/', '/about', '/privacy-policy', '/terms-of-service', '/features', '/pricing', '/contact', '/documentation', '/faq', '/blog', '/careers'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route) && route !== '/') || request.nextUrl.pathname === '/';
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup') || request.nextUrl.pathname.startsWith('/forgot-password');

  if (!user && !isPublicRoute && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  if (user) {
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    const { data: userData } = await supabase.from('users').select('profile_complete, role').eq('id', user.id).single();

    if (userData) {
      if (!userData.profile_complete && request.nextUrl.pathname !== '/profile') {
          const url = request.nextUrl.clone()
          url.pathname = '/profile'
          return NextResponse.redirect(url)
      }
    }


    // Protect admin-only routes
    if (userData && userData.role !== 'Admin' && request.nextUrl.pathname.startsWith('/analytics')) {
       const url = request.nextUrl.clone()
       url.pathname = '/dashboard'
       url.searchParams.set('error', 'unauthorized')
       return NextResponse.redirect(url)
    }
    
    // Protect admin pages
    const adminPaths = ['/admin'];
    if (userData && userData.role !== 'Admin' && adminPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
         const url = request.nextUrl.clone()
         url.pathname = '/dashboard'
         url.searchParams.set('error', 'unauthorized')
         return NextResponse.redirect(url)
    }
  }


  return response
}
