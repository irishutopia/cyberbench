import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === 'cyberbench.net') {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.hostname = 'www.cyberbench.net';
    canonicalUrl.protocol = 'https:';
    canonicalUrl.port = '';
    return NextResponse.redirect(canonicalUrl, 308);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public image/asset files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
