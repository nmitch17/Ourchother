import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { createAdminClient } from '@/lib/supabase/admin'
import { OnboardingForm } from '@/components/forms/onboarding-form'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

interface Props {
  params: Promise<{ template: string; id: string }>
  searchParams: Promise<{ project?: string }>
}

export default async function OnboardingPage({ params, searchParams }: Props) {
  const { template: templateSlug, id } = await params
  const { project: projectId } = await searchParams
  const supabase = createAdminClient()

  // Fetch the template
  const { data: template, error } = await supabase
    .from('onboarding_templates')
    .select('*')
    .eq('slug', templateSlug)
    .eq('is_active', true)
    .single()

  if (error || !template) {
    notFound()
  }

  // If projectId is provided, fetch the project data for pre-filling
  let prefillData: Record<string, string> = {}
  let linkedProjectName: string | null = null

  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('*, client:clients(*)')
      .eq('id', projectId)
      .single()

    if (project) {
      linkedProjectName = project.name

      // Map project and client data to form field names
      if (project.client) {
        if (project.client.name) prefillData.client_name = project.client.name
        if (project.client.email) prefillData.email = project.client.email
        if (project.client.phone) prefillData.phone = project.client.phone
        if (project.client.company) prefillData.company = project.client.company
      }
      if (project.name) prefillData.project_name = project.name
      if (project.description) prefillData.description = project.description
      if (project.target_end_date) prefillData.target_date = project.target_end_date
    }
  }

  return (
    <div className="landing-gradient min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto animate-fade-in-up">
        <Link href="/" className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
          ourchother
        </Link>
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Back to home
        </Link>
      </nav>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up animation-delay-100">
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-3">
            Project Onboarding
          </p>
          <h1 className={`${serif.className} text-4xl sm:text-5xl font-medium tracking-tight text-[var(--foreground)] mb-4`}>
            {template.name}
          </h1>
          {template.description && (
            <p className="text-lg text-[var(--muted)] leading-relaxed max-w-lg mx-auto">
              {template.description}
            </p>
          )}
        </div>

        {/* Pre-linked project notice */}
        {linkedProjectName && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)] animate-fade-in-up animation-delay-150">
            <p className="text-sm text-[var(--accent-text)] text-center">
              <span className="font-medium">Linked to project:</span> {linkedProjectName}
            </p>
            <p className="text-xs text-[var(--muted)] text-center mt-1">
              Some fields have been pre-filled for your convenience
            </p>
          </div>
        )}

        {/* Form */}
        <div className="animate-fade-in-up animation-delay-200">
          <OnboardingForm
            template={template}
            onboardingId={id}
            initialData={prefillData}
            projectId={projectId}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 animate-fade-in-up animation-delay-300">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-[var(--muted)]">
          <span>&copy; {new Date().getFullYear()} Ourchother</span>
        </div>
      </footer>
    </div>
  )
}
