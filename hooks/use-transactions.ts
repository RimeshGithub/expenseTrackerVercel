"use client"

// Custom hook for managing transactions with real-time updates
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { FirebaseService } from "@/lib/firebase-service"
import { isFirebaseInitialized } from "@/lib/firebase"
import type { Transaction } from "@/lib/types"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isFirebaseReady } = useAuth()

  useEffect(() => {
    if (!isFirebaseReady || !isFirebaseInitialized()) {
      setTransactions([])
      setLoading(false)
      setError("Firebase not initialized")
      return
    }

    if (!user) {
      setTransactions([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Subscribe to real-time updates
      const unsubscribe = FirebaseService.subscribeToTransactions(user.uid, (updatedTransactions) => {
        setTransactions(updatedTransactions)
        setLoading(false)
        setError(null)
      })

      // Cleanup subscription on unmount
      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up transaction subscription:", error)
      setError("Failed to connect to database")
      setLoading(false)
    }
  }, [user, isFirebaseReady])

  const addTransaction = async (transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) throw new Error("User not authenticated")
    if (!isFirebaseInitialized()) throw new Error("Firebase not initialized")

    try {
      await FirebaseService.addTransaction(user.uid, transaction)
      setError(null)
    } catch (error) {
      const errorMessage = "Failed to add transaction"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    if (!isFirebaseInitialized()) throw new Error("Firebase not initialized")

    try {
      await FirebaseService.updateTransaction(transactionId, updates)
      setError(null)
    } catch (error) {
      const errorMessage = "Failed to update transaction"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    if (!isFirebaseInitialized()) throw new Error("Firebase not initialized")

    try {
      await FirebaseService.deleteTransaction(transactionId)
      setError(null)
    } catch (error) {
      const errorMessage = "Failed to delete transaction"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteTransactionsByCategory = async (categoryId: string) => {
    try {
      const transactionsToDelete = transactions.filter((transaction) => transaction.category === categoryId)
      for (const transaction of transactionsToDelete) {
        await FirebaseService.deleteTransaction(transaction.id)
      }
      setError(null)
    } catch (error) {
      const errorMessage = "Failed to delete transactions by category"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactionsByCategory,
  }
}
