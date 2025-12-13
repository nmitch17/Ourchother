import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/onboarding/links/[linkId] - Get a link by link_id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('onboarding_links')
      .select('*, template:onboarding_templates(*), project:projects(*, client:clients(*)), submission:onboarding_submissions(*)')
      .eq('link_id', linkId)
      .single()

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Link not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PATCH /api/onboarding/links/[linkId] - Update a link (e.g., set submission_id)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const supabase = createAdminClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('onboarding_links')
      .update(body)
      .eq('link_id', linkId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/onboarding/links/[linkId] - Delete a link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('onboarding_links')
      .delete()
      .eq('link_id', linkId)

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
