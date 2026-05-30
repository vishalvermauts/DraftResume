'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import AppHeader from '@/components/AppHeader'
import { useResumeStore } from '@/lib/resumeStore'
import { Loader2, Sparkles, Download, FileText, FileType2, Eraser } from 'lucide-react'
import { exportCoverLetterPDF } from '@/lib/coverLetterPdf'
import { exportCoverLetterDOCX } from '@/lib/docxExport'
import { sansStack } from '@/lib/typography'

function App() {
  const { apiKey, provider, model, resume, lastJobDescription, lastJobCompany, lastJobRole, setLastJD, coverLetter, setCoverLetter } = useResumeStore()
  const [jd, setJd] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [tone, setTone] = useState('professional')
  const [accent, setAccent] = useState('#4f46e5')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => { setJd(lastJobDescription || ''); setCompany(lastJobCompany || ''); setRole(lastJobRole || '') }, [lastJobDescription, lastJobCompany, lastJobRole])

  const pd = resume.personalDetails || {}
  const contact = [pd.email, pd.phone, pd.linkedin].filter(Boolean).join(' • ')
  const safeName = (pd.fullName || 'cover-letter').replace(/\s+/g, '_')

  const generate = async () => {
    if (!apiKey) { toast.error('Add your API key in Settings first.'); return }
    if (jd.trim().length < 30) { toast.error('Please paste a proper job description.'); return }
    setLoading(true)
    try {
      setLastJD(jd, company, role)
      const system = `You are a professional career coach. Write a compelling, ${tone}, ATS-friendly cover letter (3-4 short paragraphs, ~280-380 words) tailored to the provided job description. Use ONLY truths derivable from the candidate's resume JSON. NEVER invent jobs, skills, or experiences not present in the resume. Output PLAIN TEXT only — no markdown, no headings, no bracketed placeholders. Begin with "Dear Hiring Manager," and end with "Sincerely," on its own line followed by the candidate's full name.`
      const user = `CANDIDATE RESUME JSON:\n${JSON.stringify(resume, null, 2)}\n\nCOMPANY: ${company || '(not specified)'}\nROLE: ${role || '(infer from JD)'}\n\nJOB DESCRIPTION:\n"""\n${jd}\n"""`
      const resp = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'x-provider': provider, ...(model ? { 'x-model': model } : {}) },
        body: JSON.stringify({ system, user, jsonMode: false }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'AI request failed')
      setCoverLetter((data.text || '').trim())
      toast.success('Cover letter generated.')
    } catch (e) { toast.error(e.message || 'Failed') } finally { setLoading(false) }
  }

  const downloadPDF = () => {
    if (!coverLetter) { toast.error('Generate a letter first.'); return }
    document.title = `${safeName}_cover_letter`
    setTimeout(() => window.print(), 50)
  }
  const downloadDOCX = async () => {
    if (!coverLetter) { toast.error('Generate a letter first.'); return }
    await exportCoverLetterDOCX({ text: coverLetter, name: pd.fullName, contact, filename: `${safeName}_cover_letter.docx` })
    toast.success('Word downloaded.')
  }

  const PAGE_W = 794, PAGE_H = 1123
  // Preview that visually matches PDF (uses pt-based sizes)
  const paragraphs = (coverLetter || '').split(/\n+/).filter((p) => p.trim().length > 0)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-right" richColors/>
      <AppHeader/>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(440px,42%)_1fr] min-h-0">
        <aside className="overflow-y-auto p-4 lg:p-5 border-r bg-slate-50 space-y-4">
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <div className="font-semibold text-sm">Job Details</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-slate-600">Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp"/></div>
              <div className="space-y-1.5"><Label className="text-xs text-slate-600">Role</Label><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Engineer"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Accent</Label>
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-full h-9 rounded border"/>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Job Description</Label>
              <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here..." className="min-h-[180px]"/>
            </div>
            <div className="flex gap-2">
              <Button onClick={generate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 flex-1">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : <><Sparkles className="w-4 h-4 mr-2"/> Generate</>}
              </Button>
              <Button variant="outline" onClick={() => setCoverLetter('')} title="Clear"><Eraser className="w-4 h-4"/></Button>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <div className="font-semibold text-sm">Edit Letter</div>
            <p className="text-xs text-slate-500">Edits below update the preview live.</p>
            <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="min-h-[300px] font-serif" placeholder="Your generated letter will appear here..."/>
          </div>
        </aside>
        <section className="min-h-0 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b bg-white sticky top-0 z-10">
            <div className="text-sm text-slate-600">Live A4 Preview</div>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700"><Download className="w-4 h-4 mr-2"/> Download</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={downloadPDF}><FileText className="w-4 h-4 mr-2"/> PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadDOCX}><FileType2 className="w-4 h-4 mr-2"/> Word (.docx)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-200 p-6">
            <div className="mx-auto" style={{ width: PAGE_W * 0.78 }}>
              <div className="origin-top relative" style={{ width: PAGE_W, transform: 'scale(0.78)', transformOrigin: 'top left' }}>
                <div className="bg-white shadow-xl" style={{ width: PAGE_W, minHeight: PAGE_H, padding: '60pt 70pt', boxSizing: 'border-box', fontFamily: sansStack, fontSize: '11pt', lineHeight: 1.45, color: '#1f2937' }}>
                  {pd.fullName && (
                    <div style={{ borderBottom: `2pt solid ${accent}`, paddingBottom: '8pt', marginBottom: '14pt' }}>
                      <div style={{ fontSize: '18pt', fontWeight: 700, color: '#0f172a' }}>{pd.fullName}</div>
                      {contact && <div style={{ fontSize: '10pt', color: '#64748b', marginTop: '2pt' }}>{contact}</div>}
                    </div>
                  )}
                  {paragraphs.length === 0 ? (
                    <div style={{ color: '#94a3b8' }}>Your cover letter will appear here. Fill in the job description on the left and click <strong>Generate</strong>.</div>
                  ) : (
                    paragraphs.map((p, i) => <p key={i} style={{ margin: '0 0 11pt' }}>{p}</p>)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Print-only copy portalled to body root */}
          {mounted && document.getElementById('print-portal') && createPortal(
            <div className="print-only">
              <div style={{ width: PAGE_W, padding: '60pt 70pt', boxSizing: 'border-box', fontFamily: sansStack, fontSize: '11pt', lineHeight: 1.45, color: '#1f2937', background: 'white' }}>
                {pd.fullName && (
                  <div style={{ borderBottom: `2pt solid ${accent}`, paddingBottom: '8pt', marginBottom: '14pt' }}>
                    <div style={{ fontSize: '18pt', fontWeight: 700, color: '#0f172a' }}>{pd.fullName}</div>
                    {contact && <div style={{ fontSize: '10pt', color: '#64748b', marginTop: '2pt' }}>{contact}</div>}
                  </div>
                )}
                {paragraphs.map((p, i) => <p key={i} style={{ margin: '0 0 11pt' }}>{p}</p>)}
              </div>
            </div>,
            document.getElementById('print-portal')
          )}
        </section>
      </div>
    </div>
  )
}

export default App
