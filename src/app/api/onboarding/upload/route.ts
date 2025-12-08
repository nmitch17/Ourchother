import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateId } from '@/lib/utils'

// POST /api/onboarding/upload - Upload file for onboarding (public)
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const formData = await request.formData()

    const file = formData.get('file') as File
    const fieldName = formData.get('fieldName') as string
    const onboardingId = formData.get('onboardingId') as string

    if (!file) {
      return NextResponse.json(
        { data: null, error: { code: 'MISSING_FILE', message: 'No file provided' } },
        { status: 400 }
      )
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${generateId()}.${fileExt}`
    const filePath = `onboarding/${onboardingId}/${fieldName}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'UPLOAD_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        path: data.path,
        fullPath: data.fullPath,
      },
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
