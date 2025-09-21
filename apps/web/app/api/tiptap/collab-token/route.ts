import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const collabSecret = process.env.TIPTAP_COLLAB_SECRET
    const collabAppId = process.env.TIPTAP_COLLAB_APP_ID

    if (!collabSecret || !collabAppId) {
      return NextResponse.json(
        { error: 'Missing Collaboration configuration' },
        { status: 500 }
      )
    }

    const now = Math.floor(Date.now() / 1000)
    
    const payload = {
      iss: "https://cloud.tiptap.dev",
      aud: collabAppId, // Your Collaboration App ID from dashboard
      exp: now + (60 * 60 * 24), // 24 hours expiration
      iat: now,
      nbf: now,
      // Add user-specific claims for collaboration
      sub: 'user-id-here', // You can customize this based on your auth system
    }

    const token = jwt.sign(payload, collabSecret, { algorithm: 'HS256' })

    return NextResponse.json({ 
      token,
      expiresAt: new Date((now + (60 * 60 * 24)) * 1000).toISOString()
    })
  } catch (error) {
    console.error('Error generating Collaboration token:', error)
    return NextResponse.json(
      { error: 'Failed to generate Collaboration token' },
      { status: 500 }
    )
  }
}