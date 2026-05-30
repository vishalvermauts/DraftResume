'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResumeStore } from '@/lib/resumeStore'
import { tailorResumeToJD } from '@/lib/aiClient'
import { Loader2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TailorDialog({ open, onOpenChange }) {
  const { apiKey, provider, model, resume, setResume, lastJobDescription, lastJobCompany, lastJobRole, setLastJD } = useResumeStore()
  const [jd, setJd] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) { setJd(lastJobDescription || ''); setCompany(lastJobCompany || ''); setRole(lastJobRole || '') }
  }, [open, lastJobDescription, lastJobCompany, lastJobRole])

  const run = async () => {
    if (!apiKey) { toast.error('Add your API key in Settings first.'); return }
    if (jd.trim().length < 40) { toast.error('Paste a more detailed job description.'); return }
    try {
      setLoading(true)
      setLastJD(jd, company, role)
      const tailored = await tailorResumeToJD({ resume, jobDescription: jd, apiKey, provider, model })
      setResume(tailored)
      toast.success('Resume tailored! JD saved for Cover Letter & ATS Score.')
      onOpenChange(false)
    } catch (e) {
      toast.error(e.message || 'Tailoring failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-indigo-600"/> Tailor to Job Description</DialogTitle>
          <DialogDescription>The AI rephrases existing bullets to align with the JD. It will not invent new jobs, degrees, or experience. We&apos;ll save this JD so the Cover Letter & ATS Score reuse it.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Company (optional)</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp"/>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Role (optional)</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Engineer"/>
          </div>
        </div>
        <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job description here..." className="min-h-[240px]"/>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={run} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Tailoring...</>) : 'Tailor Resume'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
