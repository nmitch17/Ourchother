import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/onboarding/links - List all onboarding links
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const projectId = searchParams.get('project_id')
    const hasSubmission = searchParams.get('has_submission')

    let query = supabase
      .from('onboarding_links')
      .select('*, template:onboarding_templates(*), project:projects(*, client:clients(*)), submission:onboarding_submissions(*)')
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    if (hasSubmission === 'true') {
      query = query.not('submission_id', 'is', null)
    } else if (hasSubmission === 'false') {
      query = query.is('submission_id', null)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, count, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/onboarding/links - Create a new onboarding link
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('onboarding_links')
      .insert({
        link_id: body.link_id,
        template_id: body.template_id,
        project_id: body.project_id || null,
      })
      .select('*, template:onboarding_templates(*), project:projects(*, client:clients(*))')
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
