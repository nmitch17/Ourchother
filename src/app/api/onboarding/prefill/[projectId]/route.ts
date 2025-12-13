import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/onboarding/prefill/[projectId] - Get project data for pre-filling onboarding form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const supabase = createAdminClient()

    // Fetch the project with client data
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, client:clients(*)')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      )
    }

    // Map project and client data to onboarding form field names
    // This maps to the standard web-design template fields
    const prefillData: Record<string, string> = {}

    // Client fields
    if (project.client) {
      if (project.client.name) prefillData.client_name = project.client.name
      if (project.client.email) prefillData.email = project.client.email
      if (project.client.phone) prefillData.phone = project.client.phone
      if (project.client.company) prefillData.company = project.client.company
    }

    // Project fields
    if (project.name) prefillData.project_name = project.name
    if (project.description) prefillData.description = project.description
    if (project.target_end_date) prefillData.target_date = project.target_end_date

    return NextResponse.json({
      data: {
        projectId: project.id,
        projectName: project.name,
        prefillData,
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
