'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Successfully logged in!')
        router.push('/') // Redirect to dashboard
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl overflow-hidden">
        
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600 text-white grid place-items-center shadow-lg mb-4">
            <Sparkles className="w-6 h-6"/>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isSignUp ? 'Sign up to start building your AI-powered resume.' : 'Sign in to access your saved resumes.'}
          </p>
        </div>
        
        <div className="px-8 pb-8">
          <div className="space-y-3 mb-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOAuthLogin('google')}
              className="w-full h-10 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
            >
              Continue with Google
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOAuthLogin('github')}
              className="w-full h-10 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
            >
              Continue with GitHub
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/80 backdrop-blur-xl text-slate-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
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
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
        </div>
        
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 text-center">
          <div className="text-sm text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
