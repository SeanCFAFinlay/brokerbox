import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('bb_auth')?.value;
    const isLoginPage = request.nextUrl.pathname.startsWith('/login');
    const isPublicAsset = request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/favicon.ico');

    if (isPublicAsset) {
        return NextResponse.next();
    }

    if (!authCookie && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (authCookie && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
