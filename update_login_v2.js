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
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-custom-fade-in {
          animation: customFadeIn 1s ease-out forwards;
        }
        .animate-custom-slide-up {
          animation: customSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      \`}</style>

      {/* Decorative Background Elements */}
      <div className="absolute top-12 right-[30%] w-12 h-12 text-[#FFD700] opacity-80 animate-pulse hidden lg:block">
        {/* Sparkle/Star */}
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
        </svg>
      </div>
      
      {/* Sun Doodle */}
      <div className="absolute top-1/4 left-[35%] w-24 h-24 text-[#FFD700] opacity-90 hidden lg:block animate-[spin_20s_linear_infinite] z-20">
        <svg viewBox="0 0 100 100" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round">
          <circle cx="50" cy="50" r="20" />
          <path d="M50 10L50 20M50 80L50 90M10 50L20 50M80 50L90 50M22 22L29 29M71 71L78 78M22 78L29 71M71 29L78 22" />
        </svg>
      </div>

      {/* Paper Plane Doodle */}
      <div className="absolute top-32 left-[45%] w-16 h-16 text-[#0F172A] opacity-60 hidden lg:block animate-float z-20">
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
        {/* Dashed trail */}
        <svg className="absolute -bottom-8 -left-12 w-20 h-20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
          <path d="M0 100 Q 30 50 100 0" />
        </svg>
      </div>

      {/* Crosses/Stars */}
      <div className="absolute bottom-1/4 left-1/4 w-8 h-8 text-[#0F172A] opacity-50 hidden lg:block">
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" />
        </svg>
      </div>

      <div className="absolute bottom-10 right-[40%] w-32 h-32 text-[#FFD700] opacity-40 hidden lg:block">
        <svg viewBox="0 0 100 100" stroke="currentColor" strokeWidth="4" fill="none">
          <path d="M10 10 L40 90 L90 40 Z" strokeDasharray="10 10"/>
        </svg>
      </div>

      {/* LEFT COLUMN: Visual Storytelling */}
      <div className="relative w-full lg:w-3/5 flex flex-col justify-center p-8 sm:p-12 lg:p-20 z-10 min-h-[40vh] lg:min-h-screen">
        
        {/* LOGO */}
        <div className="lg:absolute lg:top-10 lg:left-12 flex flex-col animate-custom-fade-in mb-8 lg:mb-0">
          <div className="flex items-center gap-1.5 font-black text-4xl tracking-tighter transform -rotate-3">
            <span className="text-[#E10600]">YES</span>
            <span className="text-[#0F172A]">Academy</span>
          </div>
          <div className="flex gap-1.5 mt-1 ml-2 transform -rotate-3">
             <div className="w-4 h-1 bg-[#E10600] rounded-full"></div>
             <div className="w-8 h-1 bg-[#0F172A] rounded-full"></div>
             <div className="w-4 h-1 bg-[#FFD700] rounded-full"></div>
          </div>
        </div>

        {/* HEADLINE */}
        <div className="mt-4 lg:mt-0 relative z-10 animate-custom-slide-up" style={{ opacity: 0, animationDelay: '100ms' }}>
          <h1 className={\`\${caveat.className} text-7xl sm:text-8xl lg:text-[140px] text-[#E10600] leading-[0.85] tracking-tight drop-shadow-sm transform -rotate-3 relative z-10\`}>
            Learn<br/>
            Grow<br/>
            Achieve
          </h1>
          <div className="absolute z-0 w-48 sm:w-64 lg:w-96 h-8 lg:h-12 bg-[#FFD700] bottom-4 lg:bottom-6 left-0 transform rotate-1 rounded-sm opacity-90 mix-blend-multiply"></div>
          
          <p className={\`\${caveat.className} mt-8 lg:mt-12 text-3xl lg:text-5xl text-[#0F172A] font-medium tracking-wide transform -rotate-1 relative inline-block\`}>
            Better English.<br/>
            Brighter Future.
            
            {/* Decorative lines under text */}
            <span className="absolute -bottom-4 left-0 flex flex-col gap-1.5 w-full max-w-[200px]">
              <span className="h-1 w-full bg-[#0F172A] rounded-full opacity-60 transform -rotate-1 block"></span>
              <span className="h-1 w-4/5 bg-[#0F172A] rounded-full opacity-60 transform rotate-1 block ml-4"></span>
            </span>
          </p>
          
        </div>

        {/* SCRAPBOOK COLLAGE (Abstract representations) */}
        <div className="hidden lg:block absolute top-1/2 right-4 transform -translate-y-1/2 w-[400px] h-[500px] z-0 animate-custom-fade-in pointer-events-none" style={{ opacity: 0, animationDelay: '300ms' }}>
          
          {/* Main Map Background Element */}
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#FAFAFA] opacity-80 border-2 border-gray-200 transform -rotate-12 shadow-md z-0" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
          
          {/* Yellow Scribble underneath */}
          <svg className="absolute bottom-10 left-10 w-48 h-48 text-[#FFD700] opacity-80 z-0" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 50 Q 30 10 50 50 T 90 50 Q 70 90 50 50 T 10 50 Z" />
          </svg>

          {/* Polaroid 1 (Travel/Study) */}
          <div className="absolute top-10 right-16 w-56 h-64 bg-[#FAFAFA] p-3.5 rounded-sm shadow-xl transform rotate-6 border border-gray-200 transition-transform hover:rotate-12 duration-300 z-10 pointer-events-auto">
             <div className="w-full h-44 bg-gray-200 overflow-hidden relative">
               <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400" alt="Education Journey" className="object-cover w-full h-full opacity-90 grayscale-[20%] contrast-125" />
             </div>
             <div className={\`\${caveat.className} text-center mt-3 text-2xl text-[#0F172A]\`}>Good Things Ahead :)</div>
             {/* Yellow Tape */}
             <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -rotate-3 w-20 h-6 bg-[#FFD700] opacity-90 shadow-sm mix-blend-multiply"></div>
          </div>
          
          {/* Accent red sticker */}
          <div className={\`\${caveat.className} absolute top-48 -left-4 w-32 h-32 bg-[#E10600] text-white p-4 rounded-tl-[40px] rounded-br-[30px] rounded-tr-md rounded-bl-xl transform -rotate-[15deg] shadow-[0_15px_30px_rgba(225,6,0,0.3)] flex flex-col justify-center items-center text-2xl leading-tight border-2 border-dashed border-white/40 z-20 transition-transform hover:-rotate-6 hover:scale-105 duration-300 pointer-events-auto\`}>
            <span className="text-center">Better<br/>Skills</span>
            <span className="text-center mt-1">Bigger<br/>Dreams</span>
            {/* Small yellow hearts */}
            <span className="absolute bottom-2 right-4 text-[#FFD700] text-sm">? ?</span>
          </div>

          {/* Coffee Cup / Camera elements could go here if we had SVGs, let's use simple CSS circles */}
          <div className="absolute top-[40%] right-10 w-20 h-20 bg-white rounded-full shadow-lg border border-gray-200 z-20 flex items-center justify-center transform rotate-12">
            <div className="w-16 h-16 rounded-full border-4 border-[#8B5A2B] bg-[#D2B48C] flex items-center justify-center">
              {/* Coffee art heart */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white opacity-80">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>

          <div className={\`\${caveat.className} absolute -bottom-6 right-20 text-3xl text-[#0F172A] transform rotate-6\`}>
            Start Your<br/>Journey<br/>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 inline ml-2 transform rotate-45">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Login Card */}
      <div className="relative w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 lg:pr-24 lg:pl-10 z-20 min-h-[60vh] lg:min-h-screen">
        
        {/* The Card */}
        <div className="relative w-full max-w-[440px] animate-custom-slide-up" style={{ opacity: 0, animationDelay: '200ms' }}>
          
          {/* Background offset for paper stack effect */}
          <div className="absolute inset-0 bg-white/60 transform rotate-3 rounded-xl shadow-xl -z-10"></div>
          <div className="absolute inset-0 bg-white/40 transform -rotate-1 rounded-xl shadow-md -z-10"></div>
          
          <div className="bg-[#FAFAFA] w-full p-8 sm:p-12 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-gray-100 relative">
            
            {/* Top Tape */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -rotate-2 w-32 h-8 bg-[#FFD700] shadow-sm mix-blend-multiply flex items-center justify-center">
                {/* Tape texture lines */}
                <div className="w-full h-full border-t border-b border-[#FFD700]/50 opacity-50"></div>
            </div>

            <div className="text-center mb-10 pt-2">
              <div className="flex justify-center items-center gap-1.5 font-black text-3xl sm:text-4xl mb-3 transform rotate-1">
                <span className="text-[#E10600]">YES</span>
                <span className="text-[#0F172A]">Academy</span>
              </div>
              <p className="text-[#0F172A]/70 font-bold text-sm tracking-wide mt-2">Sign in to your account</p>
            </div>
            
            {params?.error && (
              <div className="mb-6 p-4 text-sm text-[#E10600] font-medium bg-[#E10600]/10 border border-[#E10600]/20 rounded-lg flex items-center gap-3 shadow-sm">
                <svg className="w-5 h-5 shrink-0 text-[#E10600]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {params.error}
              </div>
            )}

            <LoginForm />
          </div>
          
          {/* Corner doodle */}
          <div className="absolute -bottom-10 -right-8 w-20 h-20 text-[#0F172A] opacity-70 transform -rotate-12 hidden sm:block">
             <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M10 50 L90 50 M30 10 L70 90 M70 10 L30 90" />
             </svg>
          </div>
        </div>
      </div>
      
    </div>
  )
}
`
fs.writeFileSync('src/app/login/page.tsx', pageTsx)
console.log("Files updated with richer scrapbook style")
