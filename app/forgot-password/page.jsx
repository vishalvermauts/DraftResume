'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, KeyRound, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      })
      if (error) throw error
      toast.success('Check your email for the password reset link!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl overflow-hidden">
        
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600 text-white grid place-items-center shadow-lg mb-4">
            <KeyRound className="w-6 h-6"/>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Forgot Password
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
        
        <div className="px-8 pb-8">
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 bg-white/50"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md transition-all hover:-translate-y-0.5 mt-2" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Reset Link
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => router.push('/login')}
              className="text-sm text-slate-500 hover:text-slate-800 font-medium inline-flex items-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1"/> Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
