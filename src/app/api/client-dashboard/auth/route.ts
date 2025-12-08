import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateClientToken } from '@/lib/utils/password'
import { cookies } from 'next/headers'

// POST /api/client-dashboard/auth - Validate password and create session
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { slug, password } = body

    if (!slug || !password) {
      return NextResponse.json(
        { data: null, error: { code: 'MISSING_PARAMS', message: 'Slug and password are required' } },
        { status: 400 }
      )
    }

    // Get the project by slug
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      )
    }

    if (!project.dashboard_password) {
      return NextResponse.json(
        { data: null, error: { code: 'NO_PASSWORD', message: 'This project does not have dashboard access configured' } },
        { status: 400 }
      )
    }

    // Verify password (plain text comparison)
    if (password !== project.dashboard_password) {
      return NextResponse.json(
        { data: null, error: { code: 'INVALID_PASSWORD', message: 'Invalid password' } },
        { status: 401 }
      )
    }

    // Generate JWT token and set it as a cookie
    const token = generateClientToken(project.id)

    const cookieStore = await cookies()
    cookieStore.set(`client_token_${slug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Fetch full project data with relationships
    const { data: fullProject, error: fullProjectError } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        milestones(*),
        client_tasks(*)
      `)
      .eq('id', project.id)
      .order('sort_order', { referencedTable: 'milestones', ascending: true })
      .single()

    if (fullProjectError) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: fullProjectError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { project: fullProject },
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
