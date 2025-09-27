import { useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { FirebaseService } from "./firebase-service"
import type { Category } from "./types"

export function useCategories() {
  const { user } = useAuth()

  const [expenseCategories, setExpenseCategories] = useState<Category[]>([
    { id: "food", name: "Food", icon: "🍽️", color: "bg-red-500", type: "expense" },
    { id: "transport", name: "Transport", icon: "🚗", color: "bg-blue-500", type: "expense" },
    { id: "entertainment", name: "Entertainment", icon: "🎬", color: "bg-purple-500", type: "expense" },
    { id: "bills", name: "Bills", icon: "📄", color: "bg-yellow-500", type: "expense" },
    { id: "rent", name: "Rent Expense", icon: "🏠", color: "bg-teal-500", type: "expense" },
    { id: "shopping", name: "Shopping", icon: "🛍️", color: "bg-pink-500", type: "expense" },
    { id: "health", name: "Health", icon: "🏥", color: "bg-green-500", type: "expense" },
    { id: "other", name: "Other Expense", icon: "📦", color: "bg-gray-500", type: "expense" },
  ])
  
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([
    { id: "salary", name: "Salary", icon: "💼", color: "bg-emerald-500", type: "income" },
    { id: "rent-income", name: "Rent Income", icon: "🏠", color: "bg-blue-500", type: "income" },
    { id: "investment", name: "Investment", icon: "📈", color: "bg-green-500", type: "income" },
    { id: "other-income", name: "Other Income", icon: "💰", color: "bg-yellow-500", type: "income" },
  ])

  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = FirebaseService.subscribeToCategories(user.uid, (categories) => {
      const customCategories = categories.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: "bg-gray-400",
        type: c.type
      }))
      setExpenseCategories(prev => ([...prev, ...customCategories.filter(c => c.type === "expense")]))
      setIncomeCategories(prev => ([...prev, ...customCategories.filter(c => c.type === "income")]))
    })
    
    return () => unsubscribe()
  }, [user])
  
  return { expenseCategories, incomeCategories }
}
