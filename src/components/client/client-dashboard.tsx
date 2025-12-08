'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, Badge, Button } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { Project, ClientTask, Milestone } from '@/types'

interface Props {
  project: Project
  onUpdate: () => void
}

const statusColors = {
  pending: 'warning',
  active: 'success',
  on_hold: 'warning',
  completed: 'default',
  cancelled: 'error',
} as const

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'default',
} as const

export function ClientDashboard({ project, onUpdate }: Props) {
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

  const pendingTasks = project.client_tasks?.filter(t => t.status === 'pending') || []
  const completedTasks = project.client_tasks?.filter(t => t.status === 'completed') || []
  const hasPendingTasks = pendingTasks.length > 0

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
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        <Badge variant={statusColors[project.status]}>
          {project.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Action Required Banner */}
      {hasPendingTasks && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-lg">&#9888;</span>
              <span className="font-medium text-amber-800">
                ACTION REQUIRED: You have {pendingTasks.length} task(s) that need your attention
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Tasks */}
      {(pendingTasks.length > 0 || completedTasks.length > 0) && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Your Tasks</h2>
          </CardHeader>
          <CardContent className="divide-y">
            {pendingTasks.map((task) => (
              <ClientTaskCard
                key={task.id}
                task={task}
                onComplete={() => handleCompleteTask(task.id)}
                isCompleting={completingTaskId === task.id}
              />
            ))}
            {completedTasks.map((task) => (
              <ClientTaskCard key={task.id} task={task} completed />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {project.start_date && project.target_end_date && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Timeline</h2>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">Start:</span> {formatDate(project.start_date)}
              </div>
              <div>
                <span className="font-medium">Target Completion:</span> {formatDate(project.target_end_date)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliverables */}
      {project.deliverables && project.deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Deliverables</h2>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {project.deliverables.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {project.milestones && project.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Milestones</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ClientTaskCard({
  task,
  onComplete,
  isCompleting,
  completed,
}: {
  task: ClientTask
  onComplete?: () => void
  isCompleting?: boolean
  completed?: boolean
}) {
  return (
    <div className={`py-4 ${completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {!completed && (
              <Badge variant={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
            )}
            {completed && <span className="text-green-600">&#10004;</span>}
            <span className={`font-medium ${completed ? 'line-through' : ''}`}>
              {task.title}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          {task.status_note && !completed && (
            <p className="text-sm text-amber-600 mt-1">&#9888; {task.status_note}</p>
          )}
          {task.due_date && (
            <p className="text-xs text-gray-500 mt-1">Due: {formatDate(task.due_date)}</p>
          )}

          {/* Links */}
          {task.links && task.links.length > 0 && (
            <div className="flex gap-2 mt-2">
              {task.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  {link.label} &rarr;
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
          >
            {isCompleting ? 'Saving...' : 'Mark Complete'}
          </Button>
        )}
      </div>
    </div>
  )
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const statusIcon = {
    upcoming: '\u25CB',
    in_progress: '\u25CF',
    complete: '\u2713',
    blocked: '\u2717',
  }

  return (
    <div className="flex items-start gap-3">
      <span className={`${milestone.status === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
        {statusIcon[milestone.status]}
      </span>
      <div className="flex-1">
        <div className="font-medium">{milestone.name}</div>
        {milestone.due_date && (
          <div className="text-sm text-gray-500">{formatDate(milestone.due_date)}</div>
        )}
      </div>
    </div>
  )
}
