import { Metadata } from 'next'
import SignInForm from '@/components/auth/SignInForm'
import Navbar from '@/components/common/Navbar'

export const metadata: Metadata = {
  title: 'Sign In - MyThriveBuddy',
  description: 'Sign in to your MyThriveBuddy account',
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#F8F2FF] to-[#FF69B4] py-4 sm:py-6 md:py-8 px-4">
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-4 sm:p-6 md:p-8">
          <Navbar />
          <div className="mt-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#1E2875] mb-2">Welcome Back!</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </div>
    </main>
  )
} 