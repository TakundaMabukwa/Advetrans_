// app/api/setSession/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token, role } = await req.json()

  const res = NextResponse.json({ success: true })

  res.cookies.set('__session', token, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  res.cookies.set('role', role, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return res
}
