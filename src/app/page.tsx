import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function Home() {
  return (
    <div className="landing-gradient min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto animate-fade-in-up">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          ourchother
        </Link>
        <Link
          href="/login"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Client login
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-4 animate-fade-in-up">
            AI-Native Agency for Growth
          </p>
          <h1 className={`${serif.className} text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05] animate-fade-in-up animation-delay-100`}>
            Growing abundant businesses
            <span className="block text-[var(--muted)]">together</span>
          </h1>

          <p className="mt-6 text-xl text-[var(--muted)] leading-relaxed animate-fade-in-up animation-delay-200">
            AI-first consulting, strategic business guidance, and custom development.
            I help you navigate the AI landscape and build systems that actually work.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up animation-delay-300">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors hover-lift"
            >
              Book a consultation
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Services */}
        <div className="mt-32 animate-fade-in-up animation-delay-400">
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-8">
            How I can help
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group p-6 sketch-card hover-lift">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className={`${serif.className} text-xl font-medium mb-2`}>AI Automation</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Identify repetitive tasks and build AI-powered automations that save hours every week. From workflows to intelligent agents.
              </p>
            </div>

            <div className="group p-6 sketch-card hover-lift">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <h3 className={`${serif.className} text-xl font-medium mb-2`}>Business Strategy</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Strategic guidance on integrating AI into your business operations. Cut through the hype and focus on what moves the needle.
              </p>
            </div>

            <div className="group p-6 sketch-card hover-lift">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <h3 className={`${serif.className} text-xl font-medium mb-2`}>AI Productivity</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Learn to work effectively with AI tools. Prompting, workflows, and practical techniques that multiply your output.
              </p>
            </div>

            <div className="group p-6 sketch-card hover-lift">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <h3 className={`${serif.className} text-xl font-medium mb-2`}>Custom Development</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Bespoke software and AI integrations tailored to your needs. From prototypes to production-ready systems.
              </p>
            </div>

            <div className="group p-6 sketch-card hover-lift">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className={`${serif.className} text-xl font-medium mb-2`}>AI Conversations</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Sometimes you just need to talk through ideas with someone who gets AI. No agenda, just honest conversation about possibilities.
              </p>
            </div>

            <div className="group p-6 sketch-card hover-lift flex flex-col justify-center">
              <p className="text-[var(--muted)] mb-4">
                Not sure where to start?
              </p>
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors"
              >
                Let&apos;s figure it out together
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 text-center animate-fade-in-up animation-delay-500">
          <h2 className={`${serif.className} text-3xl sm:text-4xl font-medium mb-4`}>Ready to explore what&apos;s possible?</h2>
          <p className="text-[var(--muted)] mb-8 max-w-xl mx-auto">
            Book a free 30-minute consultation. We&apos;ll talk about where you are, where you want to be, and how AI can help get you there.
          </p>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent)] text-white font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors hover-lift text-lg"
          >
            Book a consultation
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 animate-fade-in-up animation-delay-500">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-[var(--muted)]">
          <span>&copy; {new Date().getFullYear()} Ourchother</span>
          <div className="flex gap-6">
            <Link href="/schedule" className="hover:text-[var(--foreground)] transition-colors">
              Book a call
            </Link>
            <Link href="/login" className="hover:text-[var(--foreground)] transition-colors">
              Client login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
