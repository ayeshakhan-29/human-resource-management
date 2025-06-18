import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password']
const protectedPaths = ['/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('user')?.value
  const isPublicPath = publicPaths.some(path => 
    pathname.toLowerCase() === path.toLowerCase() || 
    pathname.toLowerCase().startsWith(`${path.toLowerCase()}/`)
  )
  const isProtectedPath = protectedPaths.some(path => 
    pathname.toLowerCase() === path.toLowerCase() || 
    pathname.toLowerCase().startsWith(`${path.toLowerCase()}/`)
  )

  // If there's a token and trying to access public path, redirect to dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If no token and trying to access protected path, redirect to login
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
