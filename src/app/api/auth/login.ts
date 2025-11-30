import type { NextApiRequest, NextApiResponse } from 'next'
import login from '@/app/(auth)/login/page'
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { email, password } = req.body
    login()
 
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