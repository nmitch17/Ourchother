'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/types'

interface GanttChartProps {
  milestones: Milestone[]
  startDate: string
  endDate: string
  className?: string
}

export function GanttChart({ milestones, startDate, endDate, className }: GanttChartProps) {
  const { totalDays, today, todayPosition, sortedMilestones } = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    const total = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const daysSinceStart = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const position = Math.max(0, Math.min(100, (daysSinceStart / total) * 100))

    // Sort milestones by due date
    const sorted = [...milestones].sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })

    return {
      totalDays: total,
      today: now,
      todayPosition: position,
      sortedMilestones: sorted
    }
  }, [milestones, startDate, endDate])

  const getMilestonePosition = (dueDate: string | null) => {
    if (!dueDate) return 100
    const start = new Date(startDate)
    const end = new Date(endDate)
    const due = new Date(dueDate)
    const total = end.getTime() - start.getTime()
    const elapsed = due.getTime() - start.getTime()
    return Math.max(0, Math.min(100, (elapsed / total) * 100))
  }

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'complete': return 'bg-[#3d6b4f]'
      case 'in_progress': return 'bg-[var(--accent)]'
      case 'blocked': return 'bg-[#b54a3c]'
      default: return 'bg-[var(--muted)]'
    }
  }

  const getStatusBorderColor = (status: Milestone['status']) => {
    switch (status) {
      case 'complete': return 'border-[#3d6b4f]'
      case 'in_progress': return 'border-[var(--accent)]'
      case 'blocked': return 'border-[#b54a3c]'
      default: return 'border-[var(--muted)]'
    }
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  // Generate month markers
  const monthMarkers = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const markers: { label: string; position: number }[] = []

    const current = new Date(start.getFullYear(), start.getMonth(), 1)
    while (current <= end) {
      const daysSinceStart = Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const position = (daysSinceStart / totalDays) * 100
      if (position >= 0 && position <= 100) {
        markers.push({
          label: formatMonth(current),
          position
        })
      }
      current.setMonth(current.getMonth() + 1)
    }

    return markers
  }, [startDate, endDate, totalDays])

  return (
    <div className={cn('relative', className)}>
      {/* Timeline track */}
      <div className="relative h-3 bg-[var(--border)] rounded-full overflow-hidden">
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-full transition-all duration-500"
          style={{ width: `${todayPosition}%` }}
        />

        {/* Today marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[var(--accent)] rounded-full shadow-sm z-10 transition-all duration-300"
          style={{ left: `${todayPosition}%`, transform: `translateX(-50%) translateY(-50%)` }}
        />
      </div>

      {/* Month labels */}
      <div className="relative h-6 mt-1">
        {monthMarkers.map((marker, idx) => (
          <span
            key={idx}
            className="absolute text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide"
            style={{ left: `${marker.position}%`, transform: 'translateX(-50%)' }}
          >
            {marker.label}
          </span>
        ))}
      </div>

      {/* Milestones */}
      <div className="mt-6 space-y-3">
        {sortedMilestones.map((milestone, index) => {
          const position = getMilestonePosition(milestone.due_date)
          const isComplete = milestone.status === 'complete'
          const isInProgress = milestone.status === 'in_progress'
          const isPast = position < todayPosition

          return (
            <div
              key={milestone.id}
              className="relative flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Milestone marker and connecting line */}
              <div className="relative flex-shrink-0 w-32">
                <div className="flex items-center gap-2">
                  {/* Status dot */}
                  <div className={cn(
                    'w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300',
                    getStatusColor(milestone.status),
                    isInProgress && 'ring-4 ring-[var(--accent-light)] animate-pulse'
                  )} />

                  {/* Milestone name */}
                  <span className={cn(
                    'text-sm font-medium truncate transition-colors',
                    isComplete ? 'text-[var(--muted)] line-through' : 'text-[var(--foreground)]'
                  )}>
                    {milestone.name}
                  </span>
                </div>
              </div>

              {/* Timeline bar for this milestone */}
              <div className="flex-1 relative h-6 flex items-center">
                {/* Track */}
                <div className="absolute inset-x-0 h-1 bg-[var(--border)] rounded-full" />

                {/* Fill to milestone position */}
                <div
                  className={cn(
                    'absolute h-1 rounded-full transition-all duration-500',
                    isComplete ? 'bg-[#3d6b4f]' : isPast ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                  )}
                  style={{ width: `${Math.min(position, todayPosition)}%` }}
                />

                {/* Milestone marker on track */}
                <div
                  className={cn(
                    'absolute w-4 h-4 rounded-full border-2 bg-[var(--surface)] transition-all duration-300',
                    getStatusBorderColor(milestone.status),
                    isComplete && 'bg-[#3d6b4f] border-[#3d6b4f]'
                  )}
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                >
                  {isComplete && (
                    <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Due date label */}
                {milestone.due_date && (
                  <span
                    className="absolute -bottom-5 text-[10px] text-[var(--muted)] whitespace-nowrap"
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  >
                    {new Date(milestone.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
