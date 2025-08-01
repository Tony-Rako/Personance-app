import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import AuthProvider from '@/components/providers/session-provider'
import TRPCProvider from '@/components/providers/trpc-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personance Dashboard - Personal Finance Management',
  description:
    'Your comprehensive personal finance dashboard. Track expenses, build budgets, monitor investments, and achieve your financial goals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
