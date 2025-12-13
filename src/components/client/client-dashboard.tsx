'use client'

import { useState, useMemo } from 'react'
import { Cormorant_Garamond } from 'next/font/google'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { GanttChart } from './gantt-chart'
import { ProgressRing } from './progress-ring'
import { formatDate, cn } from '@/lib/utils'
import type { Project, ClientTask, Milestone } from '@/types'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

interface Props {
  project: Project
  onUpdate: () => void
}

const statusLabels: Record<string, string> = {
  pending: 'Getting Started',
  active: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Complete',
  cancelled: 'Cancelled',
}

const priorityConfig = {
  high: { color: 'error' as const, label: 'Priority' },
  medium: { color: 'warning' as const, label: 'Action Needed' },
  low: { color: 'info' as const, label: 'When You Can' },
}

export function ClientDashboard({ project, onUpdate }: Props) {
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [expandedDeliverables, setExpandedDeliverables] = useState(false)

  const pendingTasks = project.client_tasks?.filter(t => t.status === 'pending') || []
  const completedTasks = project.client_tasks?.filter(t => t.status === 'completed') || []
  const hasPendingTasks = pendingTasks.length > 0

  // Calculate project progress
  const progress = useMemo(() => {
    const milestones = project.milestones || []
    if (milestones.length === 0) {
      // Estimate from dates if no milestones
      if (project.start_date && project.target_end_date) {
        const start = new Date(project.start_date).getTime()
        const end = new Date(project.target_end_date).getTime()
        const now = Date.now()
        const total = end - start
        const elapsed = now - start
        return Math.max(0, Math.min(100, (elapsed / total) * 100))
      }
      return 0
    }

    const completed = milestones.filter(m => m.status === 'complete').length
    return Math.round((completed / milestones.length) * 100)
  }, [project])

  // Get current milestone
  const currentMilestone = useMemo(() => {
    const milestones = project.milestones || []
    return milestones.find(m => m.status === 'in_progress') || milestones.find(m => m.status === 'upcoming')
  }, [project.milestones])

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId)
    try {
      await fetch(`/api/client-dashboard/${project.slug}/tasks/${taskId}`, {
        method: 'POST',
      })
      onUpdate()
    } catch (err) {
      console.error('Failed to complete task')
    } finally {
      setCompletingTaskId(null)
    }
  }

  return (
    <div className="client-dashboard-gradient min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto animate-fade-in-up">
        <span className="text-lg font-semibold tracking-tight text-[var(--muted)]">
          Ourchother
        </span>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {/* Hero Header */}
        <header className="pt-8 pb-12 animate-fade-in-up">
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-3">
            {statusLabels[project.status]}
          </p>
          <h1 className={`${serif.className} text-4xl sm:text-5xl font-medium tracking-tight leading-tight`}>
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-4 text-lg text-[var(--muted)] leading-relaxed">
              {project.description}
            </p>
          )}
        </header>

        {/* Action Required Banner - Subtle but noticeable */}
        {hasPendingTasks && (
          <div className="mb-8 animate-fade-in-up animation-delay-100">
            <Card variant="sketch" className="border-[var(--accent)] bg-[var(--accent-light)]">
              <CardContent className="py-5 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
                  <span className="font-medium text-[var(--accent-text)]">
                    {pendingTasks.length} item{pendingTasks.length !== 1 ? 's' : ''} need{pendingTasks.length === 1 ? 's' : ''} your attention
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Progress Overview */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up animation-delay-200">
            {/* Progress Card */}
            <Card variant="sketch" className="p-6 hover-lift">
              <div className="flex flex-col items-center text-center">
                <ProgressRing
                  progress={progress}
                  size={140}
                  strokeWidth={10}
                  label="complete"
                />

                {currentMilestone && (
                  <div className="mt-6 pt-5 border-t border-[var(--border)] w-full">
                    <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1">
                      Current Focus
                    </p>
                    <p className={`${serif.className} text-lg font-medium`}>
                      {currentMilestone.name}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Timeline Quick View */}
            {project.start_date && project.target_end_date && (
              <Card variant="sketch" className="p-6 hover-lift">
                <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-4">
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--muted)]">Started</span>
                    <span className="text-sm font-medium">{formatDate(project.start_date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--muted)]">Target</span>
                    <span className="text-sm font-medium">{formatDate(project.target_end_date)}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Deliverables */}
            {project.deliverables && project.deliverables.length > 0 && (
              <Card variant="sketch" className="p-6 hover-lift">
                <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-4">
                  What You'll Receive
                </h3>
                <ul className="space-y-2">
                  {(expandedDeliverables ? project.deliverables : project.deliverables.slice(0, 3)).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-[var(--foreground)]">{item}</span>
                    </li>
                  ))}
                </ul>
                {project.deliverables.length > 3 && (
                  <button
                    onClick={() => setExpandedDeliverables(!expandedDeliverables)}
                    className="mt-3 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                  >
                    {expandedDeliverables ? 'Show less' : `+${project.deliverables.length - 3} more`}
                  </button>
                )}
              </Card>
            )}
          </div>

          {/* Right Column - Tasks & Milestones */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up animation-delay-300">
            {/* Your Tasks */}
            {(pendingTasks.length > 0 || completedTasks.length > 0) && (
              <Card variant="sketch" className="overflow-hidden hover-lift">
                <div className="p-6 border-b border-[var(--border)]">
                  <h2 className={`${serif.className} text-xl font-medium`}>Your Tasks</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Things we need from you to keep moving forward
                  </p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {pendingTasks.map((task, index) => (
                    <ClientTaskCard
                      key={task.id}
                      task={task}
                      onComplete={() => handleCompleteTask(task.id)}
                      isCompleting={completingTaskId === task.id}
                      animationDelay={index * 50}
                    />
                  ))}
                  {completedTasks.length > 0 && pendingTasks.length > 0 && (
                    <div className="px-6 py-3 bg-[var(--background)]">
                      <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
                        Completed ({completedTasks.length})
                      </span>
                    </div>
                  )}
                  {completedTasks.map((task) => (
                    <ClientTaskCard key={task.id} task={task} completed />
                  ))}
                </div>
              </Card>
            )}

            {/* Milestones Gantt Chart */}
            {project.milestones && project.milestones.length > 0 && project.start_date && project.target_end_date && (
              <Card variant="sketch" className="overflow-hidden hover-lift">
                <div className="p-6 border-b border-[var(--border)]">
                  <h2 className={`${serif.className} text-xl font-medium`}>Project Roadmap</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Key milestones and where we are
                  </p>
                </div>
                <CardContent className="pt-8 pb-12">
                  <GanttChart
                    milestones={project.milestones}
                    startDate={project.start_date}
                    endDate={project.target_end_date}
                  />
                </CardContent>
              </Card>
            )}

            {/* Simple milestone list if no dates for Gantt */}
            {project.milestones && project.milestones.length > 0 && (!project.start_date || !project.target_end_date) && (
              <Card variant="sketch" className="overflow-hidden hover-lift">
                <div className="p-6 border-b border-[var(--border)]">
                  <h2 className={`${serif.className} text-xl font-medium`}>Project Milestones</h2>
                </div>
                <CardContent>
                  <div className="space-y-4">
                    {project.milestones.map((milestone, index) => (
                      <MilestoneItem key={milestone.id} milestone={milestone} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 animate-fade-in-up animation-delay-500">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-[var(--muted)]">
          <span>Questions? Just reach out.</span>
        </div>
      </footer>
    </div>
  )
}

function ClientTaskCard({
  task,
  onComplete,
  isCompleting,
  completed,
  animationDelay = 0,
}: {
  task: ClientTask
  onComplete?: () => void
  isCompleting?: boolean
  completed?: boolean
  animationDelay?: number
}) {
  const config = priorityConfig[task.priority]

  return (
    <div
      className={cn(
        'p-6 transition-all duration-300',
        completed ? 'opacity-60 bg-[var(--background)]' : 'hover:bg-[var(--accent-light)]/30'
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {!completed && (
              <Badge variant={config.color} className="text-[10px]">
                {config.label}
              </Badge>
            )}
            {completed && (
              <span className="text-[var(--accent)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>

          <h4 className={cn(
            'font-medium text-base',
            completed && 'line-through text-[var(--muted)]'
          )}>
            {task.title}
          </h4>

          {task.description && (
            <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
              {task.description}
            </p>
          )}

          {task.status_note && !completed && (
            <p className="text-sm text-[var(--accent)] mt-2 flex items-center gap-1.5">
              <span className="w-1 h-1 bg-[var(--accent)] rounded-full" />
              {task.status_note}
            </p>
          )}

          {task.due_date && !completed && (
            <p className="text-xs text-[var(--muted)] mt-2">
              Due {formatDate(task.due_date)}
            </p>
          )}

          {/* Links */}
          {task.links && task.links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {task.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  {link.label}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        {!completed && onComplete && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onComplete}
            disabled={isCompleting}
            className="flex-shrink-0"
          >
            {isCompleting ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving
              </span>
            ) : (
              'Mark Done'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function MilestoneItem({ milestone, index }: { milestone: Milestone; index: number }) {
  const statusConfig = {
    upcoming: { icon: '○', color: 'text-[var(--muted)]', bg: '' },
    in_progress: { icon: '◉', color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-light)]' },
    complete: { icon: '✓', color: 'text-[#3d6b4f]', bg: '' },
    blocked: { icon: '!', color: 'text-[#b54a3c]', bg: 'bg-red-50' },
  }

  const config = statusConfig[milestone.status]

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-3 rounded-lg transition-colors animate-fade-in-up',
        config.bg
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className={cn('text-lg font-medium', config.color)}>
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'font-medium',
          milestone.status === 'complete' && 'text-[var(--muted)]'
        )}>
          {milestone.name}
        </h4>
        {milestone.due_date && (
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {formatDate(milestone.due_date)}
          </p>
        )}
      </div>
    </div>
  )
}
