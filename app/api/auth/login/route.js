import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }
    
    const token = createSession();
    const cookieStore = await cookies();
    
    cookieStore.set('sk_bordados_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('sk_bordados_session');
  return NextResponse.json({ success: true });
}
