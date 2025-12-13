'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'

// Color constants for inline styles
const colors = {
  soilDeep: '#2c2416',
  soilRich: '#3d3222',
  soilWarm: '#5c4a32',
  soilLight: '#7a6548',
  sandDeep: '#a8916f',
  sandWarm: '#c4a882',
  sandLight: '#ddc9a3',
  sandPale: '#f0e6d3',
  sandCream: '#faf6ef',
  leafDeep: '#2d4a2a',
  leafRich: '#3d6439',
  leafVibrant: '#4d7c48',
  leafFresh: '#6b9b5d',
  leafYoung: '#8ab878',
  leafTender: '#b8d4a8',
  growthGold: '#d4a855',
  sunlight: '#e8c97a',
  morningDew: '#c8e0c4',
}

// Organic leaf/plant SVG component
function GrowingPlant({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main stem */}
      <path
        d="M50 200 Q50 150, 48 120 Q46 90, 50 60 Q54 30, 52 10"
        stroke={colors.leafRich}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left leaf 1 */}
      <path
        d="M48 160 Q20 150, 15 130 Q10 110, 30 100 Q45 95, 48 120"
        fill={colors.leafFresh}
        opacity="0.9"
      />
      {/* Right leaf 1 */}
      <path
        d="M52 140 Q80 130, 85 110 Q90 90, 70 82 Q55 78, 52 100"
        fill={colors.leafVibrant}
        opacity="0.85"
      />
      {/* Left leaf 2 */}
      <path
        d="M48 100 Q25 95, 18 75 Q12 55, 35 50 Q48 48, 50 70"
        fill={colors.leafYoung}
        opacity="0.9"
      />
      {/* Right leaf 2 */}
      <path
        d="M52 80 Q72 75, 78 58 Q82 42, 65 38 Q52 36, 52 55"
        fill={colors.leafFresh}
        opacity="0.85"
      />
      {/* Top unfurling leaf */}
      <path
        d="M50 40 Q35 30, 32 18 Q30 5, 45 8 Q55 10, 52 25 Q54 35, 50 40"
        fill={colors.leafTender}
        opacity="0.95"
      />
    </svg>
  )
}

// Decorative soil/earth element
function SoilWave({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      className={className}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0,60 Q360,100 720,60 T1440,60 L1440,120 L0,120 Z"
        fill={colors.soilRich}
      />
      <path
        d="M0,70 Q360,110 720,70 T1440,70 L1440,120 L0,120 Z"
        fill={colors.soilDeep}
      />
    </svg>
  )
}

// Organic blob shapes for cards
function OrganicBlob({ variant = 1, className = "" }: { variant?: number; className?: string }) {
  const blobs = [
    // Blob 1 - soft rounded
    "M45.3,-51.2C58.3,-42.7,68.1,-27.8,71.5,-11.2C74.9,5.4,71.9,23.7,62.3,38.1C52.7,52.5,36.5,63,18.8,68.1C1.1,73.2,-18.1,72.9,-33.6,65.4C-49.1,57.9,-60.9,43.2,-67.4,26.3C-73.9,9.4,-75.1,-9.7,-69.1,-26.4C-63.1,-43.1,-49.9,-57.4,-35,-64.3C-20.1,-71.2,-3.5,-70.7,11.8,-66.5C27.1,-62.3,32.3,-59.7,45.3,-51.2Z",
    // Blob 2 - leaf-like
    "M39.5,-47.7C52.9,-38.4,66.5,-28.3,71.8,-14.3C77.1,-0.3,74.1,17.6,65.3,31.7C56.5,45.8,41.9,56.1,26,62.1C10.1,68.1,-7.1,69.8,-22.4,65.1C-37.7,60.4,-51.1,49.3,-59.7,35.2C-68.3,21.1,-72.1,4,-69.5,-12C-66.9,-28,-57.9,-42.9,-45.3,-52.4C-32.7,-61.9,-16.4,-66,-0.6,-65.3C15.2,-64.6,26.1,-57,39.5,-47.7Z",
    // Blob 3 - flowing
    "M44.1,-52.8C56.4,-43.3,65,-28.5,68.4,-12.2C71.8,4.1,70,21.9,61.7,36.1C53.4,50.3,38.6,60.9,22.3,66.3C6,71.7,-11.8,71.9,-27.7,66C-43.6,60.1,-57.6,48.1,-65.2,33.1C-72.8,18.1,-74,-0.1,-69.3,-16.4C-64.6,-32.7,-54,-47.1,-40.8,-56.4C-27.6,-65.7,-11.8,-69.9,2.4,-72.8C16.6,-75.7,31.8,-62.3,44.1,-52.8Z",
    // Blob 4 - organic
    "M41.9,-48.2C54.5,-39.5,65,-26.5,69.3,-11.2C73.6,4.1,71.7,21.7,63.1,35.8C54.5,49.9,39.2,60.5,22.7,66.1C6.2,71.7,-11.5,72.3,-27.1,66.7C-42.7,61.1,-56.2,49.3,-64.1,34.5C-72,19.7,-74.3,1.9,-70.7,-14.5C-67.1,-30.9,-57.6,-45.9,-44.7,-54.5C-31.8,-63.1,-15.9,-65.3,-0.2,-65.1C15.5,-64.9,29.3,-56.9,41.9,-48.2Z",
    // Blob 5 - petal
    "M38.9,-46C50.7,-37.4,60.8,-26,66.1,-12C71.4,2,71.9,18.6,65.2,32.6C58.5,46.6,44.6,58,29.3,63.6C14,69.2,-2.7,69,-18.6,64.4C-34.5,59.8,-49.6,50.8,-58.9,37.5C-68.2,24.2,-71.7,6.6,-69.1,-10.2C-66.5,-27,-57.8,-43,-45.2,-51.5C-32.6,-60,-16.3,-61,-1.4,-59.3C13.5,-57.6,27.1,-54.6,38.9,-46Z",
    // Blob 6 - heart-like
    "M43.5,-50.5C56.4,-41.7,67,-27.8,71.1,-11.8C75.2,4.2,72.8,22.3,63.7,36.4C54.6,50.5,38.8,60.6,21.8,66.2C4.8,71.8,-13.4,72.9,-29.3,67.3C-45.2,61.7,-58.8,49.4,-66.5,34.2C-74.2,19,-76,-0.1,-71.4,-17.3C-66.8,-34.5,-55.8,-49.8,-42.2,-58.4C-28.6,-67,-14.3,-68.9,0.7,-69.8C15.7,-70.7,30.6,-59.3,43.5,-50.5Z",
  ]

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={blobs[variant - 1] || blobs[0]}
        transform="translate(100 100)"
        fill="currentColor"
      />
    </svg>
  )
}

// Service card component with two-tone organic design
function ServiceCard({
  title,
  description,
  icon,
  blobVariant,
  accentColor,
  bgColor,
}: {
  title: string
  description: string
  icon: string
  blobVariant: number
  accentColor: string
  bgColor: string
}) {
  return (
    <div
      className="group relative rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {/* Background organic blob */}
      <div
        className="absolute -right-16 -top-16 w-48 h-48 opacity-15 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"
        style={{ color: accentColor }}
      >
        <OrganicBlob variant={blobVariant} className="w-full h-full" />
      </div>

      {/* Secondary smaller blob */}
      <div
        className="absolute -left-8 -bottom-8 w-32 h-32 opacity-10 transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12"
        style={{ color: accentColor }}
      >
        <OrganicBlob variant={(blobVariant % 6) + 1} className="w-full h-full" />
      </div>

      <div className="relative z-10">
        {/* Icon container with accent color */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 8px 24px ${accentColor}40`
          }}
        >
          <Icon icon={icon} className="w-8 h-8" style={{ color: colors.sandCream }} />
        </div>

        <h3
          className="text-xl font-semibold mb-3"
          style={{ fontFamily: 'var(--font-display)', color: colors.soilDeep }}
        >
          {title}
        </h3>
        <p style={{ color: colors.soilWarm }} className="leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${colors.sandCream} 0%, ${colors.sandPale} 40%, ${colors.sandLight} 100%)`
      }}
    >
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: `${colors.sandCream}cc`,
          borderBottom: `1px solid ${colors.sandWarm}33`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(to bottom right, ${colors.leafFresh}, ${colors.leafDeep})` }}
            >
              <span
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-display)', color: colors.sandCream }}
              >
                O
              </span>
            </div>
            <span
              className="text-xl font-medium tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: colors.soilDeep }}
            >
              Ourchother
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="#services"
              className="font-medium transition-colors"
              style={{ color: colors.soilWarm }}
            >
              Services
            </Link>
            <Link
              href="#about"
              className="font-medium transition-colors"
              style={{ color: colors.soilWarm }}
            >
              About
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full font-medium transition-colors shadow-lg"
              style={{
                backgroundColor: colors.leafRich,
                color: colors.sandCream,
                boxShadow: `0 10px 25px ${colors.leafRich}33`
              }}
            >
              Client Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background decorative plants */}
        <div className="absolute left-10 bottom-0 w-32 opacity-30 animate-sway">
          <GrowingPlant />
        </div>
        <div className="absolute right-16 bottom-0 w-24 opacity-20 animate-sway" style={{ animationDelay: '2s' }}>
          <GrowingPlant />
        </div>
        <div className="absolute left-1/4 bottom-0 w-20 opacity-15 animate-sway" style={{ animationDelay: '4s' }}>
          <GrowingPlant />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Wordmark */}
          <div className="animate-grow-in mb-8">
            <h1
              className="text-7xl md:text-8xl lg:text-9xl font-light tracking-tight leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                background: `linear-gradient(90deg, ${colors.soilDeep} 0%, ${colors.soilDeep} 25%, ${colors.leafRich} 50%, ${colors.leafRich} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ourchother
            </h1>
          </div>

          {/* Tagline */}
          <p
            className="animate-fade-up text-2xl md:text-3xl font-light max-w-3xl mx-auto leading-relaxed mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              color: colors.soilWarm,
              animationDelay: '200ms'
            }}
          >
            Growing businesses with the resources they need to flourish
          </p>

          {/* Subtext */}
          <p
            className="animate-fade-up text-lg max-w-2xl mx-auto mb-12"
            style={{ color: colors.soilLight, animationDelay: '300ms' }}
          >
            An AI-native agency offering strategic consulting, custom development, and the nurturing support that transforms potential into abundance.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-center items-center" style={{ animationDelay: '400ms' }}>
            <Link
              href="#services"
              className="group px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
              style={{
                backgroundColor: colors.leafRich,
                color: colors.sandCream,
                boxShadow: `0 20px 40px ${colors.leafRich}40`
              }}
            >
              Explore Our Services
              <Icon icon="clarity:arrow-line" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#about"
              className="px-8 py-4 border-2 rounded-full font-medium text-lg transition-all duration-300"
              style={{
                borderColor: `${colors.soilWarm}66`,
                color: colors.soilDeep
              }}
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Bottom soil wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <SoilWave className="w-full h-24" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-32" style={{ backgroundColor: colors.soilDeep }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2
              className="animate-fade-up text-5xl md:text-6xl font-light mb-6"
              style={{ fontFamily: 'var(--font-display)', color: colors.sandCream }}
            >
              How We Help You <span style={{ color: colors.leafYoung }}>Grow</span>
            </h2>
            <p className="animate-fade-up text-xl max-w-2xl mx-auto" style={{ color: colors.sandWarm, animationDelay: '100ms' }}>
              Multimodal expertise combining AI-first strategies with human-centered care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              title="AI Strategy & Consulting"
              description="Navigate the AI landscape with confidence. We help you identify opportunities, build roadmaps, and implement solutions that grow with your business."
              icon="clarity:lightbulb-line"
              blobVariant={1}
              accentColor={colors.leafRich}
              bgColor={colors.sandCream}
            />
            <ServiceCard
              title="Custom Development"
              description="From MVPs to enterprise systems, we build software that embodies your vision. AI-augmented development means faster delivery without compromising quality."
              icon="clarity:code-line"
              blobVariant={2}
              accentColor={colors.leafVibrant}
              bgColor={colors.sandPale}
            />
            <ServiceCard
              title="Business Transformation"
              description="Evolve your operations with intelligent automation and streamlined workflows. We plant seeds of efficiency that bloom into lasting competitive advantages."
              icon="clarity:line-chart-line"
              blobVariant={3}
              accentColor={colors.leafFresh}
              bgColor={colors.sandCream}
            />
            <ServiceCard
              title="Product Innovation"
              description="Turn ideas into market-ready products. We guide you from concept through launch, ensuring every feature serves your users and your growth."
              icon="clarity:objects-line"
              blobVariant={4}
              accentColor={colors.growthGold}
              bgColor={colors.sandPale}
            />
            <ServiceCard
              title="Team Enablement"
              description="Empower your people with AI fluency. We provide training, workshops, and ongoing support so your team can harness these tools with confidence."
              icon="clarity:users-line"
              blobVariant={5}
              accentColor={colors.leafYoung}
              bgColor={colors.sandCream}
            />
            <ServiceCard
              title="Ongoing Partnership"
              description="Growth isn't a destination—it's continuous cultivation. We offer retainer relationships that evolve with you, providing support whenever you need it."
              icon="clarity:heart-line"
              blobVariant={6}
              accentColor={colors.leafRich}
              bgColor={colors.sandPale}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-32" style={{ backgroundColor: colors.sandPale }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="animate-fade-up text-5xl md:text-6xl font-light mb-8"
              style={{ fontFamily: 'var(--font-display)', color: colors.soilDeep }}
            >
              Why <span style={{ color: colors.leafRich, fontStyle: 'italic' }}>Ourchother</span>?
            </h2>
          </div>

          <div className="space-y-8 text-lg leading-relaxed" style={{ color: colors.soilWarm }}>
            <p className="animate-fade-up text-xl" style={{ color: colors.soilDeep, animationDelay: '100ms' }}>
              The name comes from a beautiful place—the way a child sees connection before language teaches us to separate it.
            </p>

            <p className="animate-fade-up" style={{ animationDelay: '200ms' }}>
              We believe that&apos;s what great partnerships look like. Not service provider and client, but two entities growing together. Your success is intertwined with ours. We&apos;re in this together, nurturing something that matters.
            </p>

            <p className="animate-fade-up" style={{ animationDelay: '300ms' }}>
              In a world racing toward artificial intelligence, we remain committed to authentic connection. Yes, we&apos;re AI-native—we leverage these powerful tools in everything we do. But technology serves the relationship, not the other way around.
            </p>

            <p
              className="animate-fade-up text-xl font-medium"
              style={{ fontFamily: 'var(--font-display)', color: colors.soilDeep, animationDelay: '400ms' }}
            >
              We give you the resources, the support, and the care you need to grow into something abundant and beautiful.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${colors.leafDeep}, ${colors.leafRich}, ${colors.leafVibrant})` }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-10 left-10 w-40 h-40 rounded-full blur-3xl"
            style={{ backgroundColor: colors.sunlight }}
          />
          <div
            className="absolute bottom-10 right-20 w-60 h-60 rounded-full blur-3xl"
            style={{ backgroundColor: colors.leafTender }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-4xl md:text-5xl font-light mb-6"
            style={{ fontFamily: 'var(--font-display)', color: colors.sandCream }}
          >
            Ready to grow together?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: colors.leafTender }}>
            Let&apos;s start a conversation about what&apos;s possible for your business.
          </p>
          <a
            href="mailto:hello@ourchother.com"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-semibold text-lg transition-all duration-300 hover:-translate-y-1"
            style={{
              backgroundColor: colors.sandCream,
              color: colors.leafDeep,
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
            }}
          >
            <span>Get in Touch</span>
            <Icon icon="clarity:envelope-line" className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ backgroundColor: colors.soilDeep }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom right, ${colors.leafFresh}, ${colors.leafDeep})` }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: colors.sandCream }}
                >
                  O
                </span>
              </div>
              <span
                className="text-xl font-medium tracking-tight"
                style={{ fontFamily: 'var(--font-display)', color: colors.sandWarm }}
              >
                Ourchother
              </span>
            </div>

            <div className="flex items-center gap-8" style={{ color: colors.sandWarm }}>
              <Link href="#services" className="hover:opacity-80 transition-opacity">Services</Link>
              <Link href="#about" className="hover:opacity-80 transition-opacity">About</Link>
              <Link href="/dashboard" className="hover:opacity-80 transition-opacity">Client Portal</Link>
            </div>

            <p className="text-sm" style={{ color: colors.sandDeep }}>
              &copy; {new Date().getFullYear()} Ourchother. Growing together.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
