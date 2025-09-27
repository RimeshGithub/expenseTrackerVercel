"use client"

import type React from "react"

import { useState } from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Transaction } from "@/lib/types"
import { useCategories } from "@/lib/categories-list"
import { Loader2, Save } from "lucide-react"
import DatePicker from '@sbmdkl/nepali-datepicker-reactjs'
import '@sbmdkl/nepali-datepicker-reactjs/dist/index.css'
import NepaliDate from "nepali-date-converter"
import { format } from "date-fns"
import { Category } from "@/lib/types"

interface EditTransactionFormProps {
  transaction: Transaction
  onComplete: (transaction: Transaction) => void
  onCancel: () => void
}

export function EditTransactionForm({ transaction, onComplete, onCancel }: EditTransactionFormProps) {
  const [type, setType] = useState<"expense" | "income">(transaction.type)
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [categoryData, setCategoryData] = useState<Category | null>({ id: transaction.category, name: transaction.categoryName })
  const [category, setCategory] = useState(transaction.category)
  const [categoryName, setCategoryName] = useState(transaction.categoryName)
  const [description, setDescription] = useState(transaction.description)
  const [date, setDate] = useState(transaction.date)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { expenseCategories, incomeCategories } = useCategories()

  const { updateTransaction } = useTransactions()
  const categories = type === "expense" ? expenseCategories : incomeCategories
  const bs = date ? new NepaliDate(new Date(date)).getBS() : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!amount || !categoryData || !date) {
      setError("Please fill in all fields")
      return
    }

    if (Number.parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    setLoading(true)

    try {
      await updateTransaction(transaction.id, {
        type,
        amount: Number.parseFloat(amount),
        category,
        categoryName,
        description,
        date,
      })

      const updatedTransaction: Transaction = {
        ...transaction,
        type,
        amount: Number.parseFloat(amount),
        category,
        categoryName,
        description,
        date,
        updatedAt: new Date().toISOString(),
      }

      onComplete(updatedTransaction)
    } catch (error: any) {
      setError(error.message || "Failed to update transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Transaction Type */}
      <Tabs
        value={type}
        onValueChange={(value) => {
          setType(value as "expense" | "income")
          // Reset category if switching types and current category doesn't exist in new type
          const newCategories = value === "expense" ? expenseCategories : incomeCategories
          if (!newCategories.find((cat) => cat.id === category)) {
            setCategoryData(null)
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Expense
          </TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (Rs)</Label>
        <Input
          id="amount"
          type="number"
          step="1"
          placeholder="0"
          autoComplete="off"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div className="flex flex-col gap-2 px-2" id="date">
          <label className="flex items-center gap-2">AD:
          <Input 
            type="date"
            value={date}
            required
            onChange={(e) => setDate(e.target.value)}
            className="w-70 shadow-sm rounded-md p-2.5"
          /></label>
          
          <label className="flex items-center gap-2">BS:
          <div onClick={() => !date && setDate(format(new Date(), "yyyy-MM-dd"))}>
            <DatePicker               
              key={`${bs.year}-${bs.month}-${bs.date}`} 
              inputClassName="form-control"
              className="shadow-sm rounded-md px-2.5 py-1.5 w-70 cursor-default"
              defaultDate={`${bs.year}-${String(bs.month + 1).padStart(2, '0')}-${String(bs.date).padStart(2, '0')}`}
              onChange={(newDate) => setDate(newDate.adDate)}
              options={{ calenderLocale: 'ne', valueLocale: 'en' }}
              hideDefaultValue={!date}
            />
          </div></label>            
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={categoryData ? JSON.stringify(categoryData) : ""}
          onValueChange={(val) => {
            if (!val) {
              // nothing selected
              setCategoryData(null)
              return
            }

            try {
              const parsed = JSON.parse(val) as Category
              setCategoryData(parsed)
              setCategory(parsed.id)
              setCategoryName(parsed.name)
            } catch (e) {
              console.error("Failed to parse category:", e)
            }
          }}
        >
          <SelectTrigger className="shadow-sm rounded-md p-2.5">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>

          <SelectContent>
            {categories.map((cat) => (
              <SelectItem
                key={cat.id}
                value={JSON.stringify({ id: cat.id, name: cat.name })}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold overflow-hidden">{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter transaction description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoComplete="nope"
          disabled={loading}
          rows={3}
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Update Transaction
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
