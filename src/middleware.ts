import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

const roles = [
  {
    name: 'admin',
    path: ['*'], // Admin has access to all routes
  },
  {
    name: 'call centre',
    path: ['*'], // All users have access to all routes
  },
  {
    name: 'fc',
    path: ['*'], // All users have access to all routes
  },
  {
    name: 'fleet manager',
    path: ['*'], // All users have access to all routes
  },
  {
    name: 'customer',
    path: ['*'], // All users have access to all routes
  },
  {
    name: 'cost centre',
    path: ['*'], // All users have access to all routes
  },
]

const publicRoutes = ['/login', '/signup', '/', '/logout', '/register',
  '/register/company', '/register/workshop',
  '/register/workshop/jobCard', '/register/onboarding',
  '/register/success', '/register/workshop/success',
  '/register/workshop/fileUpload']

function getAllowedPaths(role: string): string[] {
  const roleConfig = roles.find(r => r.name === role)
  if (roleConfig?.path.includes('*')) {
    return ['*'] // Admin has access to all paths
  }
  return roleConfig?.path || []
}

export async function middleware(req: NextRequest) {

  //Thsi is new section If the user is accessing the /logout page, clear cookies and redirect
  if (req.nextUrl.pathname === '/logout') {
    const response = NextResponse.redirect(new URL('/login', req.url))
    // List all cookies you want to clear
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    // Add more cookies here if needed
    return response
  }



  const path = req.nextUrl.pathname
  // Check for Supabase session cookies
  const accessToken = req.cookies.get('access_token')?.value
  const isAuthenticated = !!accessToken
  const isPublicRoute = publicRoutes.includes(path)

  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && !isPublicRoute) {
    console.log('Not authenticated — redirecting to /login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If authenticated, get user role from database
  if (isAuthenticated) {
    try {
      const supabase = createMiddlewareClient(req)
      const { data: { user }, error } = await supabase.auth.getUser()

      // Query the users table to get the role for the logged-in user
      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", (user?.id) as string)
        .single();


      if (error || userError) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      console.log("The user id is", user?.id)
      console.log("The user role is", userRecord?.role)

      if (user) {
        const role = decodeURIComponent(userRecord?.role || '')
        if (role) {
          const allowedPaths = getAllowedPaths(role)
          const isAllowed = allowedPaths.includes('*') || allowedPaths.some(p => path.startsWith(p))
          if (!isAllowed) {
            console.log(`Role "${role}" is not allowed to access "${path}" — redirecting to /dashboard`)
            return NextResponse.redirect(new URL('/login', req.url))
          }
          // switch (role) {
          //   case "call center":
          //     return NextResponse.redirect(new URL('/callcenter', req.url))
          //     break
          //   case "fleet manager":
          //     return NextResponse.redirect(new URL('/fleetManager', req.url))
          //     break
          //   case "cost center":
          //     return NextResponse.redirect(new URL('/ccenter', req.url))
          //     break
          //   case "customer":
          //     return NextResponse.redirect(new URL('/customer', req.url))
          //     break
          //   default:
          //     return NextResponse.redirect(new URL('/dashboard', req.url))
          // }
        } else {
          console.log('No role found for user — redirecting to /dashboard')
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    } catch (error) {
      console.error('Error in middleware:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next|.*\\.(?:png|jpg|jpeg|svg|ico|css|js)).*)'
  ],
}
