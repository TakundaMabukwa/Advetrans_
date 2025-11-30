import type { NextApiRequest, NextApiResponse } from 'next'
import signup from '@/app/(auth)/signup/page'
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { name, email, password } = req.body
    signup()
 
    res.status(200).json({ success: true })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      (error as { type?: unknown }).type === 'CredentialsSignin'
    ) {
      res.status(401).json({ error: 'Invalid credentials.' })
    } else {
      res.status(500).json({ error: 'Something went wrong.' })
    }
  }
}