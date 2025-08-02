'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      console.error('Sign in error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error: unknown) {
      console.error(`${provider} sign in error:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Personance
          </h1>
          <p className="text-gray-600">Sign in to manage your finances</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
            >
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
            >
              GitHub
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          For demo purposes, you can sign in with any email and password.
        </p>
      </Card>
    </div>
  )
}
