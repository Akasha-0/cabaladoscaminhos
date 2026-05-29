import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('cabala_auth')
  
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000'))
}