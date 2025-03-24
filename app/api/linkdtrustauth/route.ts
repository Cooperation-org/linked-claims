import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/route'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const secret = process.env.LINKEDTRUST_SECRET as string

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, googleId } = session.user

    const token = jwt.sign({ name, email, googleId }, secret, {
      expiresIn: '1m'
    })

    const { data } = await axios.post('https://dev.linkedtrust.us/auth/google', {
      token
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Error fetching session:', err)
    return NextResponse.json(
      { message: 'Magic link authentication failed' },
      { status: 500 }
    )
  }
}
