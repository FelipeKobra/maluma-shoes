import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api-doc') || request.nextUrl.pathname.startsWith('/api/swagger')) {
    const authHeader = request.headers.get('authorization');

    if (authHeader) {
      const auth = authHeader.split(' ')[1];
      const [user, pass] = Buffer.from(auth, 'base64').toString().split(':');

      if (user === process.env.SWAGGER_USER && pass === process.env.SWAGGER_PASS) {
        return NextResponse.next();
      }
    }

    return new NextResponse('Autenticação necessária', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Maluma Shoes API"',
      },
    });
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/api-doc/:path*', '/api/swagger/:path*'],
};