import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getAuthCredentials } from '@/lib/auth';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const AUTH_COOKIE_NAME = 'lapzen_auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const adminCreds = await getAuthCredentials();


    if (username === adminCreds.username && password === adminCreds.password) {
      const cookieStore = cookies();
      cookieStore.set(AUTH_COOKIE_NAME, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });
      return NextResponse.json({ message: 'Login successful' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
