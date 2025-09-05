import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/options'
import axios from 'axios'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const secret = process.env.LINKEDTRUST_SECRET as string

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const idToken = session?.idToken as string

    const baseUrl = process.env.NEXT_PUBLIC_LINKEDTRUST_API_URL as string

    const { data } = await axios.post(`${baseUrl}/auth/google`, {
      idToken
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Error fetching session:', err)
    return NextResponse.json(
      {
        message: `Magic link authentication failed: ${err}`,
        status: 500
      },
      { status: 500 }
    )
  }
}
