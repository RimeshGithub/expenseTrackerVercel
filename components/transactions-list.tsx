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
import { type Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { EditTransactionForm } from "./edit-transaction-form"
import NepaliDate from "nepali-date-converter"

export function TransactionsList() {
  const { transactions, loading, deleteTransaction } = useTransactions()
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  // Existing filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Date filter state
  const [useBSDate, setUseBSDate] = useState(false) // Toggle between AD/BS
  const [filterYear, setFilterYear] = useState("all")
  const [filterMonth, setFilterMonth] = useState("all")

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

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
    setFilterYear("all")
    setFilterMonth("all")
  }, [useBSDate])

  const getCategoryInfo = (categoryId: string, type: "expense" | "income") => {
    const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    return categories.find((c) => c.id === categoryId) || { name: categoryId, icon: "📦", color: "bg-gray-500" }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
    } catch (e) {
      console.error("Delete failed:", e)
    }
  }

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
          <div className="flex gap-2.5 mb-4 bg-white p-1.5 rounded-md">
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
                    {return ( 
                      <SelectItem key={category.id} value={category.id}> {category.icon} {category.name} </SelectItem> 
                    )} 
                    else if (filterType === "income" && category.type === "income") 
                    {return ( <SelectItem key={category.id} value={category.id}> {category.icon} {category.name} </SelectItem> 
                    )} 
                    else if (filterType === "all") 
                    {return ( <SelectItem key={category.id} value={category.id}> {category.icon} {category.name} </SelectItem>                
                    )} 
                  })}
                </SelectContent>
              </Select>
            </label>       
          </div>
          
          <div className="flex gap-2.5 bg-white p-1.5 rounded-md justify-between">
            {/* Calendar Type Toggle */}
            <div className="flex items-center space-x-2 bg-muted/50 px-3 rounded-md">
              <Label htmlFor="calendar-toggle" className="text-sm whitespace-nowrap">
                Filter in AD
              </Label>
              <Switch
                id="calendar-toggle"
                checked={useBSDate}
                onCheckedChange={setUseBSDate}
              />
              <Label htmlFor="calendar-toggle" className="text-sm whitespace-nowrap">
                Filter in BS
              </Label>
            </div>

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
        </CardContent>
      </Card>
      
      {/* Overview */}
      <div className="space-y-4">
        <Card>
          <CardContent className="flex justify-between items-center">
            <span className="font-semibold">Overview for selected period and category-</span>
            <span className="font-semibold">Income: Rs {incomeDisp}</span>
            <span className="font-semibold">Expense: Rs {expenseDisp}</span>
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
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center text-white`}>
                      {cat.icon}
                    </div>
                    <div>
                      <Badge variant={t.type === "income" ? "default" : "secondary"}>{cat.name}</Badge>
                      <div className="text-xs mt-1 text-muted-foreground">
                        {format(new Date(t.date), "MMM dd, yyyy")} AD | {bsMonths[bs.month]} {bs.date}, {bs.year} BS
                      </div>
                      {t.description && <p className="text-sm mt-2">{t.description}</p>}
                    </div>
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
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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