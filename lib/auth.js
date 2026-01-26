import { cookies } from 'next/headers';

const SESSION_COOKIE = 'sk_bordados_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'sua-chave-secreta-mude-isso';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function verifyPassword(password) {
  return password === ADMIN_PASSWORD;
}

export function createSession() {
  // Em produção, use uma biblioteca de sessão mais segura
  // Por simplicidade, vamos usar um token simples
  const token = Buffer.from(`${Date.now()}-${SESSION_SECRET}`).toString('base64');
  return token;
}

export function verifySession(token) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [timestamp] = decoded.split('-');
    const sessionAge = Date.now() - parseInt(timestamp);
    // Sessão válida por 24 horas
    return sessionAge < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return false;
  return verifySession(session.value);
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value || null;
}
