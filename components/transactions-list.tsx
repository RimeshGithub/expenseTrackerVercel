"use client"

import { useState, useEffect } from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { type Transaction } from "@/lib/types"
import { useCategories } from "@/lib/categories-list"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { EditTransactionForm } from "./edit-transaction-form"
import NepaliDate from "nepali-date-converter"
import { TrendingUp } from "lucide-react"
import { ca } from "date-fns/locale"

export function TransactionsList() {
  const { transactions, loading, deleteTransaction } = useTransactions()
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  // Existing filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Get today's date
  const today = new Date()
  const todayADYear = today.getFullYear()
  const todayADMonth = today.getMonth() // 0-based index
  const todayBS = new NepaliDate(today).getBS()
  const todayBSYear = todayBS.year
  const todayBSMonth = todayBS.month

  // Date filter state
  const [useBSDate, setUseBSDate] = useState(false) // Toggle between AD/BS
  const [filterYear, setFilterYear] = useState(todayADYear.toString())
  const [filterMonth, setFilterMonth] = useState(todayADMonth.toString())

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const { expenseCategories, incomeCategories } = useCategories()

  // Month names
  const adMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const bsMonths = [
    "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
    "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
  ]

  // Year options based on calendar type
  const yearOptions = useBSDate ? [2080, 2081, 2082, 2083, 2084, 2085, 2086, 2087] : [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
  const monthOptions = useBSDate ? bsMonths : adMonths

  const incomeDisp = filteredTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
  const expenseDisp = filteredTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

  // Filtering logic
  useEffect(() => {
    let filtered = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Category
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category === filterCategory)
    }

    // Date filtering based on selected calendar type
    if (filterYear !== "all") {
      filtered = filtered.filter((t) => {
        if (useBSDate) {
          const bs = new NepaliDate(new Date(t.date)).getBS()
          return bs.year.toString() === filterYear
        } else {
          return new Date(t.date).getFullYear().toString() === filterYear
        }
      })
    }

    if (filterMonth !== "all") {
      filtered = filtered.filter((t) => {
        if (useBSDate) {
          const bs = new NepaliDate(new Date(t.date)).getBS()
          return bs.month.toString() === filterMonth
        } else {
          return new Date(t.date).getMonth().toString() === filterMonth
        }
      })
    }

    setFilteredTransactions(filtered)
  }, [
    transactions,
    searchTerm,
    filterType,
    filterCategory,
    filterYear,
    filterMonth,
    useBSDate
  ])

  // Reset date filters when switching calendar type
  useEffect(() => {
    if (useBSDate) {
      setFilterYear(todayBSYear.toString())
      setFilterMonth(todayBSMonth.toString())
    } else {
      setFilterYear(todayADYear.toString())
      setFilterMonth(todayADMonth.toString())
    }
  }, [useBSDate])

  const getCategoryInfo = (categoryId: string, type: "expense" | "income") => {
    const categories = type === "expense" ? expenseCategories : incomeCategories
    return categories.find((c) => c.id === categoryId) || { name: categoryId, icon: "📦", color: "bg-gray-500" }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
    } catch (e) {
      console.error("Delete failed:", e)
    }
  }

  const allCategories = [...expenseCategories, ...incomeCategories]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between max-sm:flex-col max-sm:gap-4 max-sm:items-start">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/add">
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="px-3">
          <div className="flex gap-2.5 mb-4 bg-white p-1.5 rounded-md max-md:flex-col max-md:gap-2 max-md:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 shadow-sm"
              />
            </div>

            {/* Type Filter */}
            <label className="flex items-center gap-1">
              Type:
              <Select value={filterType} onValueChange={(v: any) => { setFilterType(v); setFilterCategory("all") }}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </label>  

            {/* Category */}
            <label className="flex items-center gap-1">
              Category:
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏷️ All Categories</SelectItem>
                  {allCategories.map((category) => { 
                    if (filterType === "expense" && category.type === "expense") 
                    {return ( <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-bold overflow-hidden">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem> 
                    )} 
                    else if (filterType === "income" && category.type === "income") 
                    {return ( <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-bold overflow-hidden">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem> 
                    )} 
                    else if (filterType === "all") 
                    {return ( <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-bold overflow-hidden">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>                
                    )} 
                  })}
                </SelectContent>
              </Select>
            </label>       
          </div>
          
          <div className="flex gap-10 bg-white px-1.5 py-3 rounded-md max-sm:flex-col max-sm:gap-4 items-center justify-center max-md:justify-between">
            {/* Calendar Type Toggle */}
            <div className="flex items-center space-x-2 bg-muted/50 px-0 rounded-md">
              <Label htmlFor="calendar-toggle" className="whitespace-nowrap">
                Filter in AD
              </Label>
              <Switch
                id="calendar-toggle"
                checked={useBSDate}
                onCheckedChange={setUseBSDate}
              />
              <Label htmlFor="calendar-toggle" className="whitespace-nowrap">
                Filter in BS
              </Label>
            </div>
            
            <div className="flex gap-2.5 max-md:flex-col max-md:gap-2 max-sm:text-sm max-sm:items-center">
              {/* Year Filter */}
              <label className="flex items-center gap-1">Year:
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder={`${useBSDate ? 'BS' : 'AD'} Year`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              {/* Month Filter */}
              <label className="flex items-center gap-1">Month:
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {monthOptions.map((m, i) => (
                      <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          </div>       
        </CardContent>
      </Card>
      
      {/* Overview */}
      <div className="space-y-4 max-md:text-sm cursor-default">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              {/* Title Section */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Financial Overview</h3>
                  <p className="text-sm text-gray-600">Selected period & category analysis</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
                {/* Income */}
                {((filterType === "all" && [...incomeCategories.map(cat => cat.id), "all"].includes(filterCategory)) || filterType === "income") && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm"></div>
                      <span className="font-semibold text-green-700 text-sm">Income</span>
                    </div>
                    <div className="text-lg font-bold text-green-900">Rs {incomeDisp}</div>
                  </div>
                )}

                {/* Expense */}
                {((filterType === "all" && [...expenseCategories.map(cat => cat.id), "all"].includes(filterCategory)) || filterType === "expense") && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-pink-500 shadow-sm"></div>
                      <span className="font-semibold text-red-700 text-sm">Expense</span>
                    </div>
                    <div className="text-lg font-bold text-red-900">Rs {expenseDisp}</div>
                  </div>
                )}

                {/* Balance */}
                {(filterType === "all" && filterCategory === "all") && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm"></div>
                      <span className="font-semibold text-amber-700 text-sm">Balance</span>
                    </div>
                    <div className={`text-lg font-bold ${(incomeDisp - expenseDisp) >= 0 ? 'text-amber-900' : 'text-red-900'}`}>
                      Rs {incomeDisp - expenseDisp}
                    </div>
                  </div>
                )}

                {/* Transactions Count */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-slate-500 shadow-sm"></div>
                    <span className="font-semibold text-gray-700 text-sm">Transactions</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{filteredTransactions.length}</div>
                </div>
              </div>
            </div>

            {/* Progress Bar for Balance (only shown when viewing all) */}
            {(filterType === "all" && filterCategory === "all" && incomeDisp > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200/60">
                {/* Header */}
                <div className="flex justify-between text-sm text-gray-700 mb-2 font-medium">
                  <span>Income vs Expense</span>
                  <span>
                    {expenseDisp > incomeDisp
                      ? "Over-budget!"
                      : `${((expenseDisp / incomeDisp) * 100).toFixed(1)}% of income spent`}
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
                  {/* Base (income axis) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-500" />

                  {/* Expense indicator */}
                  <div
                    className={`absolute inset-y-0 left-0 h-2 rounded-full bg-gradient-to-r ${
                      expenseDisp > incomeDisp
                        ? "from-red-500 to-red-600"
                        : "from-amber-500 to-red-500"
                    } transition-all duration-500`}
                    style={{
                      width: `${Math.min(100, (expenseDisp / (incomeDisp + expenseDisp)) * 100)}%`
                    }}
                  />
                </div>

                {/* Footer stats */}
                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  <span>Expense: Rs {expenseDisp} ({Math.min(100, (expenseDisp / (incomeDisp + expenseDisp)) * 100).toFixed(1)}%)</span>
                  <span>Income: Rs {incomeDisp} ({(100 - Math.min(100, (expenseDisp / (incomeDisp + expenseDisp)) * 100)).toFixed(1)}%)</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card><CardContent className="p-12 text-center">No transactions found</CardContent></Card>
        ) : (
          filteredTransactions.map((t) => {
            const cat = getCategoryInfo(t.category, t.type)
            const bs = new NepaliDate(new Date(t.date)).getBS()
            return (
              <Card key={t.id}>
                <CardContent className="p-6 flex justify-between items-center max-sm:flex-col max-sm:gap-3.5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center text-black font-bold`}>
                        {cat.icon}
                      </div>
                      <div>
                        <Badge variant={t.type === "income" ? "default" : "secondary"}>{cat.name}</Badge>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {format(new Date(t.date), "MMM dd, yyyy")} AD | {bsMonths[bs.month]} {bs.date}, {bs.year} BS
                        </div>
                      </div>
                    </div>
                    {t.description && <p className="text-sm mt-2 px-3">{t.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "income" ? "+ " : "- "}Rs {t.amount}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTransaction(t)}>
                          <Edit className="mr-2 h-4 w-4 hover:text-white" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4 hover:text-white" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update your transaction details</DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <EditTransactionForm
              transaction={editingTransaction}
              onComplete={() => setEditingTransaction(null)}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}