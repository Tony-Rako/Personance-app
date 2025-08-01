'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useSession, signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/lib/trpc'
import {
  Download,
  Trash2,
  Shield,
  Key,
  LogOut,
  AlertTriangle,
  Calendar,
  Mail,
  User,
} from 'lucide-react'

export function AccountSettings() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  // Get user profile for data export
  const { data: profile } = trpc.onboarding.getUserProfile.useQuery()

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Simulate data export (in real implementation, this would call an API)
      const userData = {
        profile: profile,
        user: {
          name: session?.user?.name,
          email: session?.user?.email,
          createdAt: new Date().toISOString(),
        },
        exportDate: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `personance-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Data Exported',
        description: 'Your data has been successfully exported to a JSON file.',
      })
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Failed to export your data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = () => {
    // In a real implementation, this would show a confirmation dialog
    // and then call a delete account API
    toast({
      title: 'Account Deletion',
      description:
        'This feature will be available soon. Please contact support for account deletion.',
    })
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Basic information about your Personance account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-sm text-gray-600">{session?.user?.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Name</span>
              </div>
              <p className="text-sm text-gray-600">
                {session?.user?.name || 'Not set'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <p className="text-sm text-gray-600">
                {profile?.createdAt ? formatDate(profile.createdAt) : 'Unknown'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Account Status</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security and authentication settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="font-medium">Password</span>
              </div>
              <p className="text-sm text-gray-500">
                Change your account password for enhanced security.
              </p>
            </div>
            <Button variant="outline" disabled>
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sign Out All Sessions</span>
              </div>
              <p className="text-sm text-gray-500">
                Sign out from all devices and browsers.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out Everywhere
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export or delete your personal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <span className="font-medium">Export Your Data</span>
              <p className="text-sm text-gray-500">
                Download a copy of all your data in JSON format.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          <Separator />

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-800">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data Protection</CardTitle>
          <CardDescription>
            Information about how we protect and handle your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Data Encryption</h4>
              <p className="text-sm text-gray-600">
                All your financial data is encrypted using industry-standard
                AES-256 encryption.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Data Location</h4>
              <p className="text-sm text-gray-600">
                Your data is stored securely in encrypted databases with regular
                backups.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Third-Party Sharing</h4>
              <p className="text-sm text-gray-600">
                We never share your personal financial data with third parties.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Data Retention</h4>
              <p className="text-sm text-gray-600">
                Your data is retained until you choose to delete your account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
