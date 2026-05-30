'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useResumeStore } from '@/lib/resumeStore'
import { Loader2, Mail, FileText, FileType2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { exportCoverLetterPDF } from '@/lib/coverLetterPdf'
import { exportCoverLetterDOCX } from '@/lib/docxExport'

export default function CoverLetterDialog({ open, onOpenChange }) {
  const { apiKey, provider, model, resume } = useResumeStore()
  const [jd, setJd] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [tone, setTone] = useState('professional')
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!apiKey) { toast.error('Add your API key in Settings first.'); return }
    if (jd.trim().length < 30) { toast.error('Please paste a proper job description.'); return }
    setLoading(true)
    try {
      const system = `You are a professional career coach. Write a compelling, ${tone}, ATS-friendly cover letter (3-4 short paragraphs, ~280-380 words) tailored to the provided job description. Use ONLY truths derivable from the candidate's resume JSON. NEVER invent jobs, skills, or experiences not present in the resume. Output PLAIN TEXT only — no markdown, no headings, no salutation labels, no bracketed placeholders. Begin with "Dear Hiring Manager," and end with "Sincerely," on its own line followed by the candidate's full name.`
      const user = `CANDIDATE RESUME JSON:\n${JSON.stringify(resume, null, 2)}\n\nCOMPANY: ${company || '(not specified)'}\nROLE: ${role || '(infer from JD)'}\n\nJOB DESCRIPTION:\n"""\n${jd}\n"""`
      const resp = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'x-provider': provider, ...(model ? { 'x-model': model } : {}) },
        body: JSON.stringify({ system, user, jsonMode: false }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'AI request failed')
      setLetter((data.text || '').trim())
      toast.success('Cover letter generated.')
    } catch (e) { toast.error(e.message || 'Failed') } finally { setLoading(false) }
  }

  const pd = resume.personalDetails || {}
  const contact = [pd.email, pd.phone, pd.linkedin].filter(Boolean).join(' • ')
  const safeName = (pd.fullName || 'cover-letter').replace(/\s+/g, '_')

  const downloadPDF = () => exportCoverLetterPDF({ text: letter, name: pd.fullName, contact, filename: `${safeName}_cover_letter.pdf` })
  const downloadDOCX = () => exportCoverLetterDOCX({ text: letter, name: pd.fullName, contact, filename: `${safeName}_cover_letter.docx` })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-indigo-600"/> AI Cover Letter Generator</DialogTitle>
          <DialogDescription>Generates a tailored cover letter using only the experience in your resume. No fabrication.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp"/>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Engineer"/>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Job Description</Label>
          <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here..." className="min-h-[120px]"/>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><Sparkles className="w-4 h-4 mr-2"/> Generate Cover Letter</>}
          </Button>
        </div>
        {letter && (
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Edit before downloading</Label>
            <Textarea value={letter} onChange={(e) => setLetter(e.target.value)} className="min-h-[280px] font-serif"/>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={downloadPDF}><FileText className="w-4 h-4 mr-2"/> Download PDF</Button>
              <Button variant="outline" onClick={downloadDOCX}><FileType2 className="w-4 h-4 mr-2"/> Download Word</Button>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
