import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSlug, generateDashboardPassword } from '@/lib/utils'

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const excludeClientId = searchParams.get('exclude_client_id')

    let query = supabase
      .from('projects')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    if (excludeClientId) {
      query = query.neq('client_id', excludeClientId)
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

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Validate client_id is provided
    if (!body.client_id) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'Client is required' } },
        { status: 400 }
      )
    }

    // Generate slug from project name
    const slug = generateSlug(body.name)

    // Generate dashboard password (stored as plain text so admin can view it)
    const dashboardPassword = generateDashboardPassword(slug)

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...body,
        slug,
        dashboard_password: dashboardPassword,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
