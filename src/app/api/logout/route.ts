import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'lapzen_auth';

export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
