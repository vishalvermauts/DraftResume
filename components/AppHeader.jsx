'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, FileText, Mail, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import SettingsModal from '@/components/resume/SettingsModal'
import { createClient } from '@/lib/supabase/client'
import { LogOut, CloudUpload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useResumeStore } from '@/lib/resumeStore'

export default function AppHeader({ children }) {
  const pathname = usePathname()
  const { apiKey, provider } = useResumeStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isResume = pathname === '/' || pathname?.startsWith('/resume')
  const isCover = pathname?.startsWith('/cover-letter')

  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const { resume, loadFromCloud, saveToCloud } = useResumeStore()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        // Optionally load cloud resume automatically when logging in
        // loadFromCloud(session.user.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
  }

  const handleSaveToCloud = async () => {
    if (!user) return
    setSaving(true)
    try {
      await saveToCloud(user.id, resume)
      toast.success('Resume saved to cloud!')
    } catch (e) {
      toast.error('Failed to save to cloud: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="px-6 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-indigo-600 text-white grid place-items-center"><Sparkles className="w-4 h-4"/></div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">DraftResume</div>
            <div className="text-[11px] text-slate-500 leading-tight">BYOK • ATS-Friendly PDF & Word</div>
          </div>
        </div>
        <nav className="ml-4 flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <Link href="/" className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition ${isResume ? 'bg-white shadow text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'}`}>
            <FileText className="w-4 h-4"/> Resume
          </Link>
          <Link href="/cover-letter" className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition ${isCover ? 'bg-white shadow text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'}`}>
            <Mail className="w-4 h-4"/> Cover Letter
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {children}
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2"/>
            {apiKey ? <span className="text-emerald-600">Key set ({provider})</span> : <span className="text-amber-600">Add API key</span>}
          </Button>

          {user && (
            <>
              <Button variant="outline" size="sm" onClick={handleSaveToCloud} disabled={saving} className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100">
                <CloudUpload className="w-4 h-4 mr-2"/> {saving ? 'Saving...' : 'Save to Cloud'}
              </Button>
              <div className="flex items-center gap-2 pl-2 border-l ml-2">
                <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">{user.email}</span>
                <Button variant="ghost" size="sm" className="px-2 text-slate-500 hover:text-red-600" onClick={handleSignOut} title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen}/>
    </header>
  )
}
