'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { Button, Card, CardHeader, CardContent, Badge } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction, RecurringRevenue, Project } from '@/types'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurring, setRecurring] = useState<RecurringRevenue[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch projects to calculate pipeline value
      const projectsRes = await fetch('/api/projects')
      const projectsData = await projectsRes.json()
      if (projectsData.data) {
        setProjects(projectsData.data)
      }

      // Note: Transactions API not yet implemented, using empty array for now
      // This is a placeholder until the transactions API is built
      setTransactions([])
      setRecurring([])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  const monthlyRecurring = recurring
    .filter((r) => r.is_active && r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0)

  const annualRecurring = recurring
    .filter((r) => r.is_active && r.frequency === 'annual')
    .reduce((sum, r) => sum + r.amount / 12, 0) // Convert to monthly

  const mrr = monthlyRecurring + annualRecurring

  // Pipeline value from active/pending projects
  const pipelineValue = projects
    .filter((p) => p.status === 'active' || p.status === 'pending')
    .reduce((sum, p) => sum + (p.project_value || 0), 0)

  // Recent transactions (last 10)
  const recentTransactions = transactions.slice(0, 10)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-1">Money</p>
          <h1 className={`${serif.className} text-3xl font-medium text-[var(--foreground)]`}>Finances</h1>
          <p className="text-[var(--muted)] mt-1">Track income, expenses, and recurring revenue</p>
        </div>
        <Link href="/finances/transactions">
          <Button variant="secondary">View All Transactions</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Total Income</p>
            <p className={`${serif.className} text-4xl font-medium text-emerald-600`}>{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Total Expenses</p>
            <p className={`${serif.className} text-4xl font-medium text-red-600`}>{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Net Profit</p>
            <p className={`${serif.className} text-4xl font-medium ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">MRR</p>
            <p className={`${serif.className} text-4xl font-medium text-[var(--accent)]`}>{formatCurrency(mrr)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Value */}
      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">Active Pipeline Value</p>
              <p className={`${serif.className} text-4xl font-medium text-[var(--foreground)]`}>{formatCurrency(pipelineValue)}</p>
              <p className="text-sm text-[var(--muted)] mt-1">
                From {projects.filter((p) => p.status === 'active' || p.status === 'pending').length} active/pending projects
              </p>
            </div>
            <Link href="/projects">
              <Button variant="secondary">View Projects</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>Recent Transactions</h2>
            <Link href="/finances/transactions" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <p className="text-[var(--muted)]">No transactions yet</p>
                <p className="text-sm text-[var(--muted)] mt-2">
                  Transaction tracking will be available in a future update
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {transaction.description || 'Untitled'}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {transaction.category || 'Uncategorized'} - {formatDate(transaction.date)}
                      </p>
                    </div>
                    <p
                      className={`font-medium ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recurring Revenue */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>Recurring Revenue</h2>
          </CardHeader>
          <CardContent>
            {recurring.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                  </svg>
                </div>
                <p className="text-[var(--muted)]">No recurring revenue set up</p>
                <p className="text-sm text-[var(--muted)] mt-2">
                  Track monthly or annual recurring income from clients
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recurring.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{item.description || 'Untitled'}</p>
                      <Badge variant={item.is_active ? 'success' : 'default'}>
                        {item.frequency}
                      </Badge>
                    </div>
                    <p className="font-medium text-emerald-600">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="mt-6 bg-[var(--accent-light)] border-[var(--accent)]">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div>
              <h3 className={`${serif.className} text-lg font-medium text-[var(--accent-text)]`}>Finances Module Coming Soon</h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Full transaction tracking, expense categorization, and financial reporting will be
                available in a future update. For now, you can view your pipeline value from
                projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
