// Firebase service for real-time data operations with error handling
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
} from "firebase/firestore"
import { getFirebaseDB } from "./firebase"
import type { Transaction, CustomCategory } from "./types"

export class FirebaseService {
  private static checkDatabase() {
    const db = getFirebaseDB()
    if (!db) {
      throw new Error("Firestore is not available. Please check your Firebase configuration.")
    }
    return db
  }

  // Add a new transaction
  static async addTransaction(
    userId: string,
    transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">,
  ) {
    try {
      const db = this.checkDatabase()
      const docRef = await addDoc(collection(db, "transactions"), {
        ...transaction,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding transaction:", error)
      throw error
    }
  }

  // Update an existing transaction
  static async updateTransaction(transactionId: string, updates: Partial<Transaction>) {
    try {
      const db = this.checkDatabase()
      const transactionRef = doc(db, "transactions", transactionId)
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error updating transaction:", error)
      throw error
    }
  }

  // Delete a transaction
  static async deleteTransaction(transactionId: string) {
    try {
      const db = this.checkDatabase()
      await deleteDoc(doc(db, "transactions", transactionId))
    } catch (error) {
      console.error("Error deleting transaction:", error)
      throw error
    }
  }

  // Get transactions for a user (one-time fetch)
  static async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const db = this.checkDatabase()
      const q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("date", "desc"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Transaction[]
    } catch (error) {
      console.error("Error getting transactions:", error)
      throw error
    }
  }

  // Subscribe to real-time transaction updates
  static subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    const db = this.checkDatabase()
    const q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("date", "desc"))

    return onSnapshot(
      q,
      (querySnapshot) => {
        const transactions = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        })) as Transaction[]

        callback(transactions)
      },
      (error) => {
        console.error("Error in transaction subscription:", error)
        callback([])
      },
    )
  }

  // Add a new category
  static async addCategory(userId: string, name: string, icon: string, type: "income" | "expense") {
    try {
      const db = this.checkDatabase()
      const docRef = await addDoc(collection(db, "categories"), {
        name: name.trim(),
        icon: icon === "" ? name.trim().charAt(0).toUpperCase() : icon,
        type,                        // <-- store category type
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding category:", error)
      throw error
    }
  }

  // Update an existing category
  static async updateCategory(
    categoryId: string,
    updates: Partial<Omit<CustomCategory, "id" | "userId">>
  ) {
    try {
      const db = this.checkDatabase()
      const categoryRef = doc(db, "categories", categoryId)
      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error updating category:", error)
      throw error
    }
  }

  // Delete a category
  static async deleteCategory(categoryId: string) {
    try {
      const db = this.checkDatabase()
      await deleteDoc(doc(db, "categories", categoryId))
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }

  // Get all categories for a user
  static async getCategories(userId: string): Promise<CustomCategory[]> {
    try {
      const db = this.checkDatabase()
      const q = query(collection(db, "categories"), where("userId", "==", userId))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as CustomCategory[]
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
    }
  }

  // Real-time subscription to categories
  static subscribeToCategories(userId: string, callback: (categories: CustomCategory[]) => void) {
    const db = this.checkDatabase()
    const q = query(collection(db, "categories"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    return onSnapshot(
      q,
      (snapshot) => {
        const categories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        })) as CustomCategory[]
        callback(categories)
      },
      (error) => {
        console.error("Error in category subscription:", error)
        callback([])
      }
    )
  }
}
