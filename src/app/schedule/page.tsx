'use client'

import { useState } from 'react'
import Link from 'next/link'

// Generate next 14 days of available dates (excluding weekends)
function getAvailableDates(): Date[] {
  const dates: Date[] = []
  const today = new Date()
  let current = new Date(today)
  current.setDate(current.getDate() + 1) // Start from tomorrow

  while (dates.length < 10) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) {
      // Skip weekends
      dates.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// Available time slots
const timeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
]

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'details' | 'confirmed'>('select')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    notes: '',
  })

  const availableDates = getAvailableDates()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to an API
    setStep('confirmed')
  }

  return (
    <div className="landing-gradient min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          ourchother
        </Link>
        <Link
          href="/login"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Sign in
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {step === 'confirmed' ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium mb-3">You&apos;re all set!</h1>
            <p className="text-[var(--muted)] mb-2">
              Your consultation is scheduled for
            </p>
            <p className="text-lg font-medium mb-1">
              {selectedDate && formatDateFull(selectedDate)} at {selectedTime}
            </p>
            <p className="text-sm text-[var(--muted)] mb-8">
              We&apos;ll send a calendar invite to {formData.email}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-10 animate-fade-in-up">
              <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight mb-2">
                Schedule a consultation
              </h1>
              <p className="text-[var(--muted)]">
                Book a free 30-minute call to discuss your project needs.
              </p>
            </div>

            {step === 'select' && (
              <div className="space-y-8 animate-fade-in-up animation-delay-100">
                {/* Date Selection */}
                <div>
                  <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-4">
                    Select a date
                  </h2>
                  <div className="grid grid-cols-5 gap-2">
                    {availableDates.map((date, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-lg border text-center transition-all hover-lift ${
                          selectedDate?.toDateString() === date.toDateString()
                            ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent-text)]'
                            : 'border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface)]'
                        }`}
                      >
                        <div className="text-xs text-[var(--muted)] mb-1">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="font-medium">
                          {date.getDate()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div className="animate-fade-in-up">
                    <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-4">
                      Select a time
                    </h2>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border text-center transition-all hover-lift ${
                            selectedTime === time
                              ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent-text)]'
                              : 'border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface)]'
                          }`}
                        >
                          <span className="text-sm font-medium">{time}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                {selectedDate && selectedTime && (
                  <div className="pt-4 animate-fade-in-up">
                    <button
                      onClick={() => setStep('details')}
                      className="w-full py-3 bg-[var(--accent)] text-white font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors hover-lift"
                    >
                      Continue
                    </button>
                    <p className="text-center text-sm text-[var(--muted)] mt-3">
                      {formatDate(selectedDate)} at {selectedTime} &middot; 30 minutes
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 'details' && (
              <div className="animate-fade-in-up">
                <button
                  onClick={() => setStep('select')}
                  className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-6 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Change time
                </button>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[var(--accent)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedDate && formatDate(selectedDate)} at {selectedTime}
                      </p>
                      <p className="text-sm text-[var(--muted)]">30-minute consultation</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company <span className="text-[var(--muted)]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="Acme Inc."
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-2">
                      What would you like to discuss?{' '}
                      <span className="text-[var(--muted)]">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                      placeholder="Tell us a bit about your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[var(--accent)] text-white font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors hover-lift mt-6"
                  >
                    Confirm booking
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
