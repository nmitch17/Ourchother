'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardHeader, CardContent, Badge } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction, RecurringRevenue, Project } from '@/types'

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
          <p className="text-gray-500 mt-1">Track income, expenses, and recurring revenue</p>
        </div>
        <Link href="/finances/transactions">
          <Button variant="secondary">View All Transactions</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">MRR</p>
            <p className="text-2xl font-bold text-accent">{formatCurrency(mrr)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Value */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Pipeline Value</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(pipelineValue)}</p>
              <p className="text-sm text-gray-400 mt-1">
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
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link href="/finances/transactions">
              <span className="text-sm text-accent hover:underline">View all</span>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Transaction tracking will be available in a future update
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description || 'Untitled'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category || 'Uncategorized'} - {formatDate(transaction.date)}
                      </p>
                    </div>
                    <p
                      className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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
            <h2 className="text-lg font-semibold">Recurring Revenue</h2>
          </CardHeader>
          <CardContent>
            {recurring.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recurring revenue set up</p>
                <p className="text-sm text-gray-400 mt-2">
                  Track monthly or annual recurring income from clients
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recurring.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.description || 'Untitled'}</p>
                      <Badge variant={item.is_active ? 'success' : 'default'}>
                        {item.frequency}
                      </Badge>
                    </div>
                    <p className="font-medium text-green-600">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">&#9432;</span>
            <div>
              <h3 className="font-semibold text-blue-900">Finances Module Coming Soon</h3>
              <p className="text-sm text-blue-700 mt-1">
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
