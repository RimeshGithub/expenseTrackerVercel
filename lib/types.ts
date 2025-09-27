// TypeScript interfaces for the expense tracker
export interface Transaction {
  id: string
  userId: string
  type: "expense" | "income"
  amount: number
  category: string
  categoryName: string
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: "expense" | "income"
}

export interface CustomCategory {
  id: string
  name: string
  icon: string
  type: "income" | "expense"   // <-- NEW: Defines if the category is for income or expense
  userId: string
  createdAt: string
  updatedAt: string
}

export interface MonthlyStats {
  totalIncome: number
  totalExpenses: number
  balance: number
  categoryBreakdown: { [key: string]: number }
}

// export const EXPENSE_CATEGORIES: Category[] = [
//   { id: "food", name: "Food", icon: "🍽️", color: "bg-red-500", type: "expense" },
//   { id: "transport", name: "Transport", icon: "🚗", color: "bg-blue-500", type: "expense" },
//   { id: "entertainment", name: "Entertainment", icon: "🎬", color: "bg-purple-500", type: "expense" },
//   { id: "bills", name: "Bills", icon: "📄", color: "bg-yellow-500", type: "expense" },
//   { id: "rent", name: "Rent Expense", icon: "🏠", color: "bg-yellow-500", type: "expense" },
//   { id: "shopping", name: "Shopping", icon: "🛍️", color: "bg-pink-500", type: "expense" },
//   { id: "health", name: "Health", icon: "🏥", color: "bg-green-500", type: "expense" },
//   { id: "other", name: "Other Expense", icon: "📦", color: "bg-gray-500", type: "expense" },
// ]

// export const INCOME_CATEGORIES: Category[] = [
//   { id: "salary", name: "Salary", icon: "💼", color: "bg-emerald-500", type: "income" },
//   { id: "rent-income", name: "Rent Income", icon: "🏠", color: "bg-blue-500", type: "income" },
//   { id: "investment", name: "Investment", icon: "📈", color: "bg-green-500", type: "income" },
//   { id: "other-income", name: "Other Income", icon: "💰", color: "bg-yellow-500", type: "income" },
// ]
