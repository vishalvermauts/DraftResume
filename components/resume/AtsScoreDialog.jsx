'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useResumeStore } from '@/lib/resumeStore'
import { Loader2, Target, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

function extractJson(text) {
  let t = (text || '').trim()
  if (t.startsWith('```')) t = t.replace(/^```(?:json|JSON)?\s*/i, '').replace(/```\s*$/i, '').trim()
  try { return JSON.parse(t) } catch (_) {}
  let depth = 0, start = -1, inStr = false, esc = false
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]
    if (inStr) { if (esc) { esc = false; continue } if (ch === '\\') { esc = true; continue } if (ch === '"') inStr = false; continue }
    if (ch === '"') inStr = true
    else if (ch === '{') { if (depth === 0) start = i; depth++ }
    else if (ch === '}') { depth--; if (depth === 0 && start !== -1) return JSON.parse(t.slice(start, i + 1)) }
  }
  throw new Error('No JSON in response')
}

export default function AtsScoreDialog({ open, onOpenChange }) {
  const { apiKey, provider, model, resume } = useResumeStore()
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const run = async () => {
    if (!apiKey) { toast.error('Add your API key in Settings first.'); return }
    if (jd.trim().length < 40) { toast.error('Please paste a more detailed job description.'); return }
    setLoading(true); setResult(null)
    try {
      const system = `You are an ATS (Applicant Tracking System) scoring expert. Analyze how well a resume matches a job description. Return STRICT JSON of shape: { "score": number 0-100, "matchedKeywords": string[], "missingKeywords": string[], "strengths": string[], "gaps": string[], "recommendations": string[] }. No prose, no markdown, just one JSON object.`
      const user = `RESUME JSON:\n${JSON.stringify(resume)}\n\nJOB DESCRIPTION:\n"""\n${jd}\n"""`
      const resp = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'x-provider': provider, ...(model ? { 'x-model': model } : {}) },
        body: JSON.stringify({ system, user, jsonMode: true }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'AI request failed')
      setResult(extractJson(data.text))
    } catch (e) { toast.error(e.message || 'Scoring failed') } finally { setLoading(false) }
  }

  const scoreColor = result ? (result.score >= 80 ? 'text-emerald-600' : result.score >= 60 ? 'text-amber-600' : 'text-red-600') : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600"/> ATS Match Score</DialogTitle>
          <DialogDescription>Scores your current resume against a JD. Tailor your resume (Wand button) and re-run to see the improvement.</DialogDescription>
        </DialogHeader>
        <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description..." className="min-h-[140px]"/>
        <div>
          <Button onClick={run} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Scoring...</> : 'Compute ATS Score'}
          </Button>
        </div>
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-extrabold ${scoreColor}`}>{result.score}<span className="text-2xl text-slate-400">/100</span></div>
              <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${result.score >= 80 ? 'bg-emerald-500' : result.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${result.score}%` }}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-sm text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Matched Keywords</div>
                <div className="text-xs text-slate-700 mt-1 flex flex-wrap gap-1">{(result.matchedKeywords || []).map((k, i) => <span key={i} className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{k}</span>)}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-red-700 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Missing Keywords</div>
                <div className="text-xs text-slate-700 mt-1 flex flex-wrap gap-1">{(result.missingKeywords || []).map((k, i) => <span key={i} className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{k}</span>)}</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-700">Recommendations</div>
              <ul className="text-sm text-slate-700 list-disc pl-5 mt-1 space-y-0.5">
                {(result.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}
              </ul>
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
