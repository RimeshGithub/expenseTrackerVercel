"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useTransactions } from "@/hooks/use-transactions"
import { User, Shield, Database, HelpCircle, Download, Trash2, Settings, Palette } from "lucide-react"
import { useState, useEffect } from "react"
import {
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import { FirebaseService } from "@/lib/firebase-service"
import { toast } from "@/hooks/use-toast"
import { CustomCategory } from "@/lib/types"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { transactions, deleteTransactionsByCategory } = useTransactions()

  // Profile settings state
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Custom categories state
  const [newCategory, setNewCategory] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("")
  const [categoryType, setCategoryType] = useState<"income" | "expense">("expense")
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [isAddingCategories, setIsAddingCategories] = useState(false)

  const handleUpdateProfile = async () => {
    if (!user) return

    setIsUpdatingProfile(true)
    try {
      await updateProfile(user, { displayName })
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user || !user.email) return

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExportData = async (format: "csv" | "json") => {
    if (!transactions.length) {
      toast({
        title: "No Data",
        description: "You don't have any transactions to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      let content: string
      let filename: string
      let mimeType: string

      if (format === "csv") {
        const headers = ["Date", "Type", "Category", "Amount", "Description"]
        const csvContent = [
          headers.join(","),
          ...transactions.map((t) =>
            [
              t.date,
              t.type,
              t.categoryName,
              t.amount.toString(),
              `"${t.description.replace(/"/g, '""')}"`,
            ].join(","),
          ),
        ].join("\n")

        content = csvContent
        filename = `expense-tracker-${new Date().toISOString().split("T")[0]}.csv`
        mimeType = "text/csv"
      } else {
        const filteredTransactions = transactions.map((t) => ({date: t.date, category: t.categoryName, type: t.type, amount: t.amount, description: t.description, createdAt: t.createdAt, updatedAt: t.updatedAt}))
        content = JSON.stringify(filteredTransactions, null, 2)
        filename = `expense-tracker-${new Date().toISOString().split("T")[0]}.json`
        mimeType = "application/json"
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Your data has been exported as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (!user?.uid) return

    // Subscribe to real-time updates
    const unsubscribe = FirebaseService.subscribeToCategories(user.uid, (categories) => {
      setCustomCategories(categories)   // <-- This triggers rerender every time categories change
    })

    // Cleanup subscription when component unmounts or user changes
    return () => unsubscribe()
  }, [user?.uid])

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    setIsAddingCategories(true)
    try {
      await FirebaseService.addCategory(user.uid, newCategory, newCategoryIcon, categoryType)
      setNewCategory("")
      setNewCategoryIcon("")

      toast({
        title: "Category Added",
        description: `"${newCategory}" has been added as a ${categoryType} category.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add the category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingCategories(false)
    }
  }

  const handleRemoveCategory = async (categoryId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this category and all the transactions associated with it?")
    if (!confirmDelete) return
    try {
      await FirebaseService.deleteCategory(categoryId)
      await deleteTransactionsByCategory(categoryId)
      toast({
        title: "Category Removed",
        description: "The category has been removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove the category.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.",
    )

    if (!confirmDelete) return

    const password = window.prompt("Please enter your password to confirm account deletion:")
    if (!password) return

    setIsDeletingAccount(true)
    try {
      // Re-authenticate user before deleting account
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)

      // Delete user account
      await deleteUser(user)

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and other settings.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    defaultValue={user?.displayName || ""}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toUTCString() : "N/A"}
                  </p>
                </div>
                <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile} size="sm">
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="text"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="off"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !currentPassword || !newPassword}
                  size="sm"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>Manage your financial data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download your transaction history ({transactions.length} transactions)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportData("csv")} disabled={isExporting}>
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export CSV"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData("json")} disabled={isExporting}>
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export JSON"}
                  </Button>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Custom Categories
                </CardTitle>
                <CardDescription>Manage your custom expense and income categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs
                  value={categoryType}
                  onValueChange={(value) => {
                    setCategoryType(value as "expense" | "income")
                    setNewCategory("") // Reset category when type changes
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2 gap-1">
                    <TabsTrigger value="expense" className="bg-gray-300 data-[state=active]:text-white data-[state=active]:bg-red-600">
                      Expense
                    </TabsTrigger>
                    <TabsTrigger value="income" className="bg-gray-300 data-[state=active]:text-white data-[state=active]:bg-green-600">
                      Income
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-2">
                  <Input
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    placeholder="Icon"
                    className="flex-1"
                    autoComplete="nope"
                  />
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Category name"
                    className="flex-4"
                    autoComplete="nope"
                  />
                  <Button onClick={handleAddCategory} size="sm">
                    {isAddingCategories ? "Adding..." : "Add"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Your Custom Categories</Label>
                  {customCategories.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No custom categories yet</p>
                  ) : (
                    <div className="space-y-2 overflow-auto max-h-[200px]">
                      {customCategories.map((category) => (
                        <div
                          key={category.id}
                          className={`flex items-center justify-between p-2 border rounded
                            ${category.type === "income" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-sm w-5 text-center font-bold overflow-hidden">{category.icon}</span>
                              <span className="text-sm font-medium">{category.name}</span>
                            </div>
                            <span
                              className={`px-1 text-xs ${
                                category.type === "income" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {category.type === "income" ? "Income" : "Expense"}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCategory(category.id)}
                            className="hover:bg-red-500"
                          >
                            <Trash2 className="h-4 w-4 hover:text-white" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support
                </CardTitle>
                <CardDescription>Get help and support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Need Help?</Label>
                  <p className="text-sm text-muted-foreground">Contact our support team or check the documentation</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("mailto:developer2061@outlook.com", "_blank")}
                  >
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open("/docs", "_blank")}>
                    Documentation
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">App Version</Label>
                  <p className="text-sm text-muted-foreground">v0.1.0</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
