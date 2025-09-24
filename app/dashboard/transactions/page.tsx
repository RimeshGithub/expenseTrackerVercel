"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TransactionsList } from "@/components/transactions-list"

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <TransactionsList />
      </DashboardLayout>
    </AuthGuard>
  )
}
