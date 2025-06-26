import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // API nativa de cookies do Next.js

export async function middleware(req: Request) {
  const cookieStore = await cookies(); 
  const token = cookieStore.get('auth.token')?.value; 

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url)); 
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: ['/buscador/:path*','/perfil/:path*'], 
};