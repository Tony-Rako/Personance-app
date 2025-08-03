'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/contexts/currency-context'
import { Loader2 } from 'lucide-react'

const preferencesSchema = z.object({
  preferredCurrency: z.string().nullable().optional(),
  notificationsEnabled: z.boolean().nullable().optional(),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

const currencyOptions = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)', symbol: 'CAD' },
  { value: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'AUD' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
]

export function PreferencesSettings() {
  const { toast } = useToast()
  const { updateCurrency } = useCurrency()

  // Get user profile data
  const { data: profile, isLoading } = trpc.onboarding.getUserProfile.useQuery()
  const utils = trpc.useUtils()

  // Update profile mutation
  const updateProfile = trpc.onboarding.saveUserProfile.useMutation({
    onSuccess: () => {
      toast({
        title: 'Preferences Updated',
        description: 'Your preferences have been successfully updated.',
      })
      utils.onboarding.getUserProfile.invalidate()
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update preferences.',
        variant: 'destructive',
      })
    },
  })

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferredCurrency: 'USD',
      notificationsEnabled: true,
    },
  })

  // Load profile data into form when available
  useEffect(() => {
    if (profile) {
      reset({
        preferredCurrency: profile.preferredCurrency || 'USD',
        notificationsEnabled: profile.notificationsEnabled ?? true,
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: PreferencesFormData) => {
    // Preserve existing profile data while updating preferences
    const newCurrency = data.preferredCurrency || 'USD'

    await updateProfile.mutateAsync({
      ...profile,
      preferredCurrency: newCurrency,
      notificationsEnabled: data.notificationsEnabled ?? true,
    })

    // Update currency context to immediately reflect changes throughout the app
    updateCurrency(newCurrency)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading preferences...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Currency Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Currency & Display</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred Currency</Label>
            <Select
              value={watch('preferredCurrency') || 'USD'}
              onValueChange={value =>
                setValue('preferredCurrency', value, { shouldDirty: true })
              }
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{option.symbol}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Choose your preferred currency for displaying amounts throughout
              the app.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Notification Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive email notifications about goal progress, financial
                insights, and important updates.
              </p>
            </div>
            <Switch
              checked={watch('notificationsEnabled') ?? true}
              onCheckedChange={checked =>
                setValue('notificationsEnabled', checked, { shouldDirty: true })
              }
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Notification Types</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Goal milestone achievements</li>
              <li>• Monthly financial summaries</li>
              <li>• Budget alerts and overspending warnings</li>
              <li>• Investment opportunity insights</li>
              <li>• Security and account updates</li>
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      {/* Privacy Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Privacy</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Data Privacy</h4>
            <p className="text-sm text-blue-800">
              Your financial data is encrypted and stored securely. We never
              share your personal information with third parties without your
              explicit consent. You can export or delete your data at any time
              from the Account settings.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Data Usage</h4>
            <p className="text-sm text-green-800">
              We use your financial profile to provide personalized
              recommendations and insights. All analysis is performed locally or
              through encrypted connections. Your specific financial amounts are
              never transmitted to external services.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="min-w-24"
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}
