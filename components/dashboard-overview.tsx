"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react"
import Link from "next/link"
import { useTransactions } from "@/hooks/use-transactions"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types"
import { format } from "date-fns"
import NepaliDate from "nepali-date-converter"
import { useState } from "react"

export function DashboardOverview() {
  const { transactions, loading } = useTransactions()
  const [calendarMode, setCalendarMode] = useState<"ad" | "bs">("ad")

  const now = new Date()
  const currentADMonth = now.getMonth()
  const currentADYear = now.getFullYear()

  const currentBS = new NepaliDate(now).getBS()
  const currentBSMonth = currentBS.month
  const currentBSYear = currentBS.year
  const BSmonths = ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"]

  // --- FILTER by selected calendar mode ---
  const filteredTransactions = transactions.filter((t) => {
    const adDate = new Date(t.date) // assuming AD date is stored in DB
    const bsDate = new NepaliDate(adDate).getBS()

    if (calendarMode === "ad") {
      return adDate.getMonth() === currentADMonth && adDate.getFullYear() === currentADYear
    } else {
      return bsDate.month === currentBSMonth && bsDate.year === currentBSYear
    }
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  // --- CALCULATIONS ---
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // category breakdown
  const categoryBreakdownObj = filteredTransactions.reduce((acc, t) => {
    if (t.type !== "expense") return acc
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const categoryBreakdown = Object.entries(categoryBreakdownObj).map(([categoryId, amount]) => {
    const categoryInfo = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(
      (cat) => cat.id === categoryId
    )
    return {
      category: categoryInfo?.name || categoryId,
      amount,
      color: categoryInfo?.color || "bg-gray-500",
    }
  }).sort((a, b) => b.amount - a.amount)

  // Top 5 recent transactions
  const recentTransactions = filteredTransactions.slice(0, 5)

  const getCategoryInfo = (categoryId: string, type: "expense" | "income") => {
    const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    return categories.find((cat) => cat.id === categoryId) || {
      name: categoryId,
      icon: "📦",
      color: "bg-gray-500",
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between max-md:flex-col max-md:gap-4 max-md:items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {calendarMode === "ad"
              ? `Financial overview for ${format(new Date(), "MMMM yyyy")} AD.`
              : `Financial overview for ${BSmonths[currentBSMonth]} ${currentBSYear} BS.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={calendarMode === "ad" ? "default" : "outline"}
            onClick={() => setCalendarMode("ad")}
          >
            AD
          </Button>
          <Button
            variant={calendarMode === "bs" ? "default" : "outline"}
            onClick={() => setCalendarMode("bs")}
          >
            BS
          </Button>
          <Button asChild>
            <Link href="/dashboard/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">Rs {balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs {totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rs {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Categories</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">Active this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions + Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No transactions yet</p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/add">Add your first transaction</Link>
                  </Button>
                </div>
              ) : (
                recentTransactions.map((transaction) => {
                  const categoryInfo = getCategoryInfo(transaction.category, transaction.type)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{categoryInfo.name}</p>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        </div>
                      </div>
                      <div
                        className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"} Rs {transaction.amount}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {recentTransactions.length > 0 && (
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/dashboard/transactions">View All Transactions</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Category Breakdown</CardTitle>
            <CardDescription>Your spending by category this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.slice(0, 6).map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <span className="font-medium">Rs {category.amount}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No expense categories yet</p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/add">Add an expense</Link>
                  </Button>
                </div>
              )}
            </div>
            {categoryBreakdown.length > 0 && (
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/dashboard/analytics">View Analytics</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
