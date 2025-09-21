import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const aiSecret = process.env.TIPTAP_AI_SECRET
    const aiAppId = process.env.TIPTAP_AI_APP_ID

    if (!aiSecret || !aiAppId) {
      return NextResponse.json(
        { error: 'Missing AI configuration' },
        { status: 500 }
      )
    }

    const now = Math.floor(Date.now() / 1000)
    
    const payload = {
      iss: "https://cloud.tiptap.dev",
      aud: aiAppId, // Your AI App ID from dashboard
      exp: now + (60 * 60 * 24), // 24 hours expiration
      iat: now,
      nbf: now
    }

    const token = jwt.sign(payload, aiSecret, { algorithm: 'HS256' })

    return NextResponse.json({ 
      token,
      expiresAt: new Date((now + (60 * 60 * 24)) * 1000).toISOString()
    })
  } catch (error) {
    console.error('Error generating AI token:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI token' },
      { status: 500 }
    )
  }
}