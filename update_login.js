const fs = require('fs')

const pageTsx = `import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import { Caveat } from 'next/font/google'

const caveat = Caveat({ subsets: ['latin'], weight: ['700'] })

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (data?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#B7D8F5] overflow-hidden relative selection:bg-[#FFD700] selection:text-[#0F172A] font-sans">
      
      {/* --- INLINE STYLES FOR ANIMATIONS --- */}
      <style>{\`
        @keyframes customFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes customSlideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-custom-fade-in {
          animation: customFadeIn 1s ease-out forwards;
        }
        .animate-custom-slide-up {
          animation: customSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      \`}</style>

      {/* Decorative Background Elements */}
      <div className="absolute top-12 right-24 w-12 h-12 text-[#FFD700] opacity-80 animate-pulse hidden lg:block">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0L55 35L90 40L60 60L70 95L50 75L30 95L40 60L10 40L45 35Z" />
        </svg>
      </div>
      <div className="absolute bottom-16 left-12 w-32 h-32 text-[#FFD700] opacity-40 hidden lg:block">
        <svg viewBox="0 0 100 100" stroke="currentColor" strokeWidth="3" fill="none">
          <circle cx="50" cy="50" r="40" strokeDasharray="8 8" />
        </svg>
      </div>
      <div className="absolute top-1/4 left-1/3 w-8 h-8 text-[#E10600] opacity-50 hidden lg:block">
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* LEFT COLUMN: Visual Storytelling */}
      <div className="relative w-full lg:w-3/5 flex flex-col justify-center p-8 sm:p-12 lg:p-20 z-10 min-h-[40vh] lg:min-h-screen">
        
        {/* LOGO */}
        <div className="lg:absolute lg:top-12 lg:left-12 flex flex-col animate-custom-fade-in mb-12 lg:mb-0">
          <div className="flex items-center gap-1.5 font-black text-4xl tracking-tighter transform -rotate-2">
            <span className="text-[#E10600]">YES</span>
            <span className="text-[#0F172A]">Academy</span>
          </div>
          <div className="flex gap-1.5 mt-1 ml-1">
             <div className="w-5 h-1.5 bg-[#FFD700] rounded-full"></div>
             <div className="w-10 h-1.5 bg-[#E10600] rounded-full"></div>
             <div className="w-5 h-1.5 bg-[#0F172A] rounded-full"></div>
          </div>
        </div>

        {/* HEADLINE */}
        <div className="mt-4 lg:mt-0 relative z-10 animate-custom-slide-up" style={{ opacity: 0, animationDelay: '100ms' }}>
          <h1 className={\`\${caveat.className} text-7xl sm:text-8xl lg:text-[140px] text-[#E10600] leading-[0.85] tracking-tight drop-shadow-sm transform -rotate-3\`}>
            Learn<br/>
            Grow<br/>
            Achieve
          </h1>
          <div className="absolute -z-10 w-48 sm:w-64 lg:w-96 h-6 lg:h-10 bg-[#FFD700] bottom-4 lg:bottom-6 left-0 transform rotate-1 rounded-sm opacity-80 mix-blend-multiply"></div>
          
          <p className={\`\${caveat.className} mt-8 lg:mt-12 text-3xl lg:text-5xl text-[#0F172A] font-medium tracking-wide transform -rotate-1\`}>
            Better English.<br/>
            Brighter Future.
          </p>
          
          {/* Decorative lines under text */}
          <div className="mt-6 flex flex-col gap-2 w-32">
            <div className="h-1 w-full bg-[#0F172A] rounded-full opacity-30 transform -rotate-1"></div>
            <div className="h-1 w-4/5 bg-[#0F172A] rounded-full opacity-30 transform rotate-1"></div>
          </div>
        </div>

        {/* SCRAPBOOK COLLAGE (Abstract representations) */}
        <div className="hidden lg:block absolute top-1/2 right-12 transform -translate-y-1/2 w-[350px] h-[450px] z-0 animate-custom-fade-in" style={{ opacity: 0, animationDelay: '300ms' }}>
          {/* Polaroid 1 */}
          <div className="absolute top-10 right-10 w-56 h-64 bg-[#FAFAFA] p-3.5 rounded-sm shadow-xl transform rotate-6 border border-gray-200 transition-transform hover:rotate-12 duration-300 z-10">
             <div className="w-full h-44 bg-gray-200 overflow-hidden relative">
               <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400" alt="Education Journey" className="object-cover w-full h-full opacity-90 grayscale-[20%] contrast-125" />
             </div>
             <div className={\`\${caveat.className} text-center mt-4 text-2xl text-[#0F172A]\`}>Good Things Ahead :)</div>
             {/* Yellow Tape */}
             <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -rotate-3 w-20 h-6 bg-[#FFD700] opacity-90 mix-blend-multiply"></div>
          </div>
          
          {/* Accent red sticker */}
          <div className={\`\${caveat.className} absolute top-48 -left-8 w-40 h-40 bg-[#E10600] text-white p-5 rounded-tl-3xl rounded-br-2xl rounded-tr-md rounded-bl-lg transform -rotate-12 shadow-[0_15px_30px_rgba(225,6,0,0.3)] flex flex-col justify-center items-center text-3xl leading-tight border-2 border-dashed border-white/40 z-20 transition-transform hover:-rotate-6 hover:scale-105 duration-300\`}>
            <span className="text-center">Better<br/>Skills</span>
            <span className="text-center mt-2">Bigger<br/>Dreams</span>
            <span className="absolute bottom-3 right-3 text-yellow-300"></span>
          </div>

          {/* Doodles */}
          <svg className="absolute bottom-10 right-20 w-32 h-32 text-[#0F172A] opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 80 Q 50 10 80 80" />
            <path d="M70 70 L 80 80 L 70 90" />
            <path d="M10 20 L 30 30" strokeDasharray="4 4" />
          </svg>
          <div className={\`\${caveat.className} absolute -bottom-2 right-12 text-2xl text-[#0F172A] transform rotate-6\`}>
            Start Your Journey
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Login Card */}
      <div className="relative w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 lg:pr-20 lg:pl-10 z-20">
        
        {/* The Card */}
        <div className="relative w-full max-w-[420px] animate-custom-slide-up" style={{ opacity: 0, animationDelay: '200ms' }}>
          
          {/* Background offset for paper stack effect */}
          <div className="absolute inset-0 bg-white/50 transform rotate-3 rounded-xl shadow-xl -z-10"></div>
          <div className="absolute inset-0 bg-[#FFD700]/10 transform -rotate-2 rounded-xl -z-20 border border-[#FFD700]/30"></div>
          
          <div className="bg-[#FAFAFA] w-full p-8 sm:p-12 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-gray-100 relative">
            
            {/* Top Tape */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 rotate-2 w-28 h-8 bg-[#FFD700] shadow-sm mix-blend-multiply flex items-center justify-center">
                {/* Tape texture lines */}
                <div className="w-full h-full border-t border-b border-[#FFD700]/50 opacity-50"></div>
            </div>

            <div className="text-center mb-10 pt-4">
              <div className="flex justify-center items-center gap-1.5 font-black text-3xl mb-3">
                <span className="text-[#E10600]">YES</span>
                <span className="text-[#0F172A]">Academy</span>
              </div>
              <p className="text-[#0F172A]/70 font-semibold text-sm uppercase tracking-wider">Sign in to your account</p>
            </div>
            
            {params?.error && (
              <div className="mb-6 p-4 text-sm text-[#E10600] font-medium bg-[#E10600]/10 border border-[#E10600]/20 rounded-lg flex items-center gap-3 shadow-sm">
                <svg className="w-5 h-5 shrink-0 text-[#E10600]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {params.error}
              </div>
            )}

            <LoginForm />
          </div>
          
          {/* Corner star doodle */}
          <div className="absolute -bottom-10 -right-6 w-20 h-20 text-[#0F172A] opacity-70 transform rotate-12 hidden sm:block">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
               <path d="M12 2l3 7 7 1-5 5 1 7-7-4-7 4 1-7-5-5 7-1z" strokeLinejoin="round" />
             </svg>
          </div>
        </div>
      </div>
      
    </div>
  )
}
`

const loginFormTsx = `'use client'

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
          borderBottomLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderBottomRightRadius: '8px',
          borderTopLeftRadius: '8px',
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
            placeholder="••••••••"
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
`

fs.writeFileSync('src/app/login/page.tsx', pageTsx)
fs.writeFileSync('src/app/login/LoginForm.tsx', loginFormTsx)

console.log("Files updated")
