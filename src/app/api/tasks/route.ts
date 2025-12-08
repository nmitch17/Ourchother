import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Get the max sort_order for this project
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('sort_order')
      .eq('project_id', body.project_id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = existingTasks && existingTasks.length > 0
      ? existingTasks[0].sort_order + 1
      : 0

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...body,
        sort_order: nextSortOrder,
      })
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
