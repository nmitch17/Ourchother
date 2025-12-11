import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/documents - List all documents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const projectId = searchParams.get('project_id')
    const search = searchParams.get('search')

    let query = supabase
      .from('documents')
      .select('*, project:projects(id, name, slug)')
      .order('updated_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,path.ilike.%${search}%`)
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

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.path) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'Title and path are required' } },
        { status: 400 }
      )
    }

    // Check if path already exists
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('path', body.path)
      .single()

    if (existing) {
      return NextResponse.json(
        { data: null, error: { code: 'DUPLICATE_PATH', message: 'A document with this path already exists' } },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: body.title,
        path: body.path,
        project_id: body.project_id || null,
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
