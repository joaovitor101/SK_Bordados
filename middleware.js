import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('sk_bordados_session');
  
  // Permitir acesso público apenas à página de login e API de autenticação
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Proteger todas as rotas da API (exceto auth)
  if (pathname.startsWith('/api/')) {
    if (!sessionCookie || !verifySession(sessionCookie.value)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
  }
  
  // Proteger a página principal
  if (pathname === '/') {
    if (!sessionCookie || !verifySession(sessionCookie.value)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
