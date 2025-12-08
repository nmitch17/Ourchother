import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyClientToken } from '@/lib/utils/password'
import { cookies } from 'next/headers'

// GET /api/client-dashboard/[slug] - Get project data for client dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { slug } = await params

    // Check for auth token in cookies
    const cookieStore = await cookies()
    const token = cookieStore.get(`client_token_${slug}`)?.value

    if (!token) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // Verify token
    const payload = verifyClientToken(token)
    if (!payload) {
      return NextResponse.json(
        { data: null, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } },
        { status: 401 }
      )
    }

    // Get project with slug and verify it matches the token
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        milestones(*),
        client_tasks(*)
      `)
      .eq('slug', slug)
      .eq('id', payload.projectId)
      .order('sort_order', { referencedTable: 'milestones', ascending: true })
      .single()

    if (error || !project) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: project, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
