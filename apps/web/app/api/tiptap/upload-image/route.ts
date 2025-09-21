import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@repo/auth'
import { headers } from 'next/headers'

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-north-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for Supabase S3
})

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate user-specific file path
    const fileExtension = file.name.split('.').pop()
    const fileName = `users/${session.user.id}/editor-images/${Date.now()}-${uuidv4()}.${fileExtension}`
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to documents bucket
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_DOCUMENTS_BUCKET_NAME || 'documents',
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make images publicly accessible
    })

    await s3Client.send(uploadCommand)

    // Return the public URL
    const publicUrl = `${process.env.S3_ENDPOINT}/object/public/${process.env.NEXT_PUBLIC_DOCUMENTS_BUCKET_NAME}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}