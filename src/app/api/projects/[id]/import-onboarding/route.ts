import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/projects/[id]/import-onboarding - Import data from an onboarding submission
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = createAdminClient()
    const body = await request.json()

    const { submission_id } = body

    if (!submission_id) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'submission_id is required' } },
        { status: 400 }
      )
    }

    // Get the submission
    const { data: submission, error: submissionError } = await supabase
      .from('onboarding_submissions')
      .select('*, template:onboarding_templates(*)')
      .eq('id', submission_id)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Submission not found' } },
        { status: 404 }
      )
    }

    // Check if already imported to this project
    if (submission.project_id === projectId) {
      return NextResponse.json(
        { data: null, error: { code: 'ALREADY_IMPORTED', message: 'This submission has already been imported to this project' } },
        { status: 400 }
      )
    }

    // Link the submission to the project and update status
    const { error: updateError } = await supabase
      .from('onboarding_submissions')
      .update({
        project_id: projectId,
        status: 'imported',
      })
      .eq('id', submission_id)

    if (updateError) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: updateError.message } },
        { status: 500 }
      )
    }

    // Optionally, we could auto-populate project fields from submission data here
    // For now, we just link them - the user can manually review and copy data

    return NextResponse.json({
      data: {
        message: 'Onboarding data imported successfully',
        submission_id,
        project_id: projectId,
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
