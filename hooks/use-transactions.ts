"use client"

// Custom hook for managing transactions with real-time updates
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { FirebaseService } from "@/lib/firebase-service"
import type { Transaction } from "@/lib/types"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Subscribe to real-time updates
    const unsubscribe = FirebaseService.subscribeToTransactions(user.uid, (updatedTransactions) => {
      setTransactions(updatedTransactions)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [user])

  const addTransaction = async (transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) throw new Error("User not authenticated")

    try {
      await FirebaseService.addTransaction(user.uid, transaction)
    } catch (error) {
      setError("Failed to add transaction")
      throw error
    }
  }

  const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    try {
      await FirebaseService.updateTransaction(transactionId, updates)
    } catch (error) {
      setError("Failed to update transaction")
      throw error
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    try {
      await FirebaseService.deleteTransaction(transactionId)
    } catch (error) {
      setError("Failed to delete transaction")
      throw error
    }
  }

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
