"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseChart } from "./expense-chart"
import { CategoryChart } from "./category-chart"
import { TrendChart } from "./trend-chart"
import { IncomeVsExpenseChart } from "./income-vs-expense-chart"
import { useAnalytics } from "@/hooks/use-analytics"
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react"

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("3months")
  const { analytics, loading } = useAnalytics()

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your financial patterns and trends.</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs {analytics.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rs {analytics.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">Rs {analytics.balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.savingsRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Of total income</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <Card className="flex items-center">
              <CardHeader className="w-full">
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Monthly comparison of your income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeVsExpenseChart data={analytics.monthlyTrend} />
              </CardContent>
            </Card>

            <Card className="flex items-center">
              <CardHeader className="w-full">
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Breakdown of your spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.categoryBreakdown.length > 0 ? (
                  <CategoryChart data={analytics.categoryBreakdown} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expense data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
              <CardDescription>Your highest expense categories this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCategories.length > 0 ? (
                  analytics.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.percentage.toFixed(2)}% of total expenses
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs {category.amount}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No expense categories available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <Card className="flex items-center">
              <CardHeader className="w-full">
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Visual breakdown of spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.categoryBreakdown.length > 0 ? (
                  <CategoryChart data={analytics.categoryBreakdown} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex items-center">
              <CardHeader className="w-full">
                <CardTitle>Category Spending</CardTitle>
                <CardDescription>Detailed spending amounts by category</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.categoryBreakdown.length > 0 ? (
                  <ExpenseChart data={analytics.categoryBreakdown} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No spending data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>Track your financial patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart data={analytics.monthlyTrend} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
