'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { login } from './actions'
import GlobalLoader from '@/components/GlobalLoader'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <>
      {pending && <GlobalLoader />}
      <button
        type="submit"
        disabled={pending}
        className="group relative w-full flex justify-center items-center gap-3 py-4 px-6 mt-4 text-white font-bold text-lg bg-[#E10600] hover:bg-[#C00500] focus:outline-none focus:ring-4 focus:ring-[#E10600]/30 disabled:opacity-70 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_6px_0_#9A0400] hover:shadow-[0_4px_0_#9A0400] active:shadow-none"
                style={{
          borderRadius: '2px 255px 3px 225px / 255px 5px 225px 3px',
          border: 'solid 2px transparent'
        }}
      >
        Sign in
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
      </button>
    </>
  )
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className="space-y-6" action={login}>
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-[#0F172A] mb-2">
          Email address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#0F172A]/40 group-focus-within:text-[#B7D8F5] transition-colors z-10">
            <Mail className="w-5 h-5" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-[#0F172A] bg-white focus:outline-none focus:border-[#B7D8F5] focus:ring-4 focus:ring-[#B7D8F5]/20 transition-all placeholder-gray-400 font-medium text-base shadow-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-[#0F172A] mb-2">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#0F172A]/40 group-focus-within:text-[#B7D8F5] transition-colors z-10">
            <Lock className="w-5 h-5" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="relative w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-[#0F172A] bg-white focus:outline-none focus:border-[#B7D8F5] focus:ring-4 focus:ring-[#B7D8F5]/20 transition-all placeholder-gray-400 font-medium text-base shadow-sm"
            placeholder="��������"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#0F172A]/40 hover:text-[#0F172A] transition-colors focus:outline-none z-10"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  )
}
