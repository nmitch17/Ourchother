import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { OnboardingForm } from '@/components/forms/onboarding-form'

interface Props {
  params: Promise<{ template: string; id: string }>
}

export default async function OnboardingPage({ params }: Props) {
  const { template: templateSlug, id } = await params
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

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
        {template.description && (
          <p className="text-gray-600 mt-2">{template.description}</p>
        )}
      </div>

      <OnboardingForm
        template={template}
        onboardingId={id}
      />
    </div>
  )
}
