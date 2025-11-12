import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only check for public paths - authentication is handled client-side
  const isPublicPath = publicPaths.some(path =>
    pathname.toLowerCase() === path.toLowerCase() ||
    pathname.toLowerCase().startsWith(`${path.toLowerCase()}/`)
  )

  // Let the client-side authentication handle redirects
  // This middleware only prevents access to protected routes without proper setup
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
