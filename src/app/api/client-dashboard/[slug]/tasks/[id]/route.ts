import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyClientToken } from '@/lib/utils/password'
import { cookies } from 'next/headers'

// POST /api/client-dashboard/[slug]/tasks/[id]/complete - Mark task as completed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { slug, id } = await params

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

    // Verify the task belongs to this project
    const { data: task, error: taskError } = await supabase
      .from('client_tasks')
      .select('*, project:projects(*)')
      .eq('id', id)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Task not found' } },
        { status: 404 }
      )
    }

    if (task.project_id !== payload.projectId) {
      return NextResponse.json(
        { data: null, error: { code: 'FORBIDDEN', message: 'You do not have access to this task' } },
        { status: 403 }
      )
    }

    // Update the task status
    const { data: updatedTask, error: updateError } = await supabase
      .from('client_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: updateError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: updatedTask, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
