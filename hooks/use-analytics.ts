"use client"

// Custom hook for analytics data
import { useMemo } from "react"
import { useTransactions } from "./use-transactions"
import { FirebaseService } from "@/lib/firebase-service"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types"

export function useAnalytics() {
  const { transactions, loading } = useTransactions()

  const analytics = useMemo(() => {
    if (loading || transactions.length === 0) {
      return null
    }

    const stats = FirebaseService.calculateAnalytics(transactions)
    const monthlyTrend = FirebaseService.getMonthlyTrend(transactions)

    // Category breakdown with colors and icons
    const categoryBreakdown = Object.entries(stats.categoryBreakdown).map(([categoryId, amount]) => {
      const categoryInfo = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find((cat) => cat.id === categoryId)
      return {
        category: categoryInfo?.name || categoryId,
        amount,
        color: categoryInfo?.color || "bg-gray-500",
      }
    })

    // Top categories
    const topCategories = categoryBreakdown
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
      .map((cat) => ({
        category: cat.category,
        amount: cat.amount,
        percentage: (cat.amount / stats.totalExpenses) * 100,
      }))

    const savingsRate = stats.totalIncome > 0 ? (stats.balance / stats.totalIncome) * 100 : 0

    return {
      ...stats,
      monthlyTrend,
      categoryBreakdown,
      topCategories,
      savingsRate,
    }
  }, [transactions, loading])

  return {
    analytics,
    loading,
  }
}
