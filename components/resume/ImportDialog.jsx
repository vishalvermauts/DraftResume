'use client'
import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResumeStore } from '@/lib/resumeStore'
import { extractTextFromFile } from '@/lib/parsers'
import { extractResumeFromText } from '@/lib/aiClient'
import { Upload, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function ImportDialog({ open, onOpenChange }) {
  const { apiKey, provider, model, setResume } = useResumeStore()
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const inputRef = useRef(null)

  const handleImport = async () => {
    if (!apiKey) { toast.error('Please add your API key in Settings first.'); return }
    if (!file) { toast.error('Please choose a PDF or DOCX file.'); return }
    try {
      setStatus('parsing')
      const text = await extractTextFromFile(file)
      if (!text || text.length < 30) throw new Error('Could not extract text from file.')
      setStatus('ai')
      const json = await extractResumeFromText({ rawText: text, apiKey, provider, model })
      setResume(json)
      toast.success('Resume imported & parsed!')
      onOpenChange(false)
      setStatus('idle')
      setFile(null)
    } catch (e) {
      setStatus('idle')
      toast.error(e.message || 'Import failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Existing Resume</DialogTitle>
          <DialogDescription>Upload a PDF or DOCX. We extract the text in your browser and let your AI provider parse it into structured JSON.</DialogDescription>
        </DialogHeader>
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-8 text-center cursor-pointer bg-slate-50 transition"
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-slate-700">
              <FileText className="w-5 h-5 text-indigo-600"/>
              <span className="font-medium">{file.name}</span>
            </div>
          ) : (
            <div className="text-slate-500">
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400"/>
              <div className="font-medium">Click to upload</div>
              <div className="text-xs mt-1">.pdf, .docx, or .txt</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={status !== 'idle'}>Cancel</Button>
          <Button onClick={handleImport} disabled={status !== 'idle' || !file} className="bg-indigo-600 hover:bg-indigo-700">
            {status === 'parsing' && (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Parsing file...</>)}
            {status === 'ai' && (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Extracting with AI...</>)}
            {status === 'idle' && 'Import & Parse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
