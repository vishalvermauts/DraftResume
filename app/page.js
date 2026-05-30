'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from 'sonner'
import EditorPanel from '@/components/resume/EditorPanel'
import PreviewPanel from '@/components/resume/PreviewPanel'
import ImportDialog from '@/components/resume/ImportDialog'
import TailorDialog from '@/components/resume/TailorDialog'
import AtsScoreDialog from '@/components/resume/AtsScoreDialog'
import AppHeader from '@/components/AppHeader'
import { useResumeStore, emptyResume, sampleResume } from '@/lib/resumeStore'
import { FileText, Upload, Wand2, RotateCcw, Target } from 'lucide-react'

function App() {
  const [importOpen, setImportOpen] = useState(false)
  const [tailorOpen, setTailorOpen] = useState(false)
  const [atsOpen, setAtsOpen] = useState(false)
  const { setResume } = useResumeStore()

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-emerald-50 flex flex-col">
      <Toaster position="top-right" richColors/>
      <AppHeader>
        <Button variant="outline" size="sm" onClick={() => setResume(sampleResume)}><RotateCcw className="w-4 h-4 mr-2"/> Sample</Button>
        <Button variant="outline" size="sm" onClick={() => setResume(emptyResume)}><FileText className="w-4 h-4 mr-2"/> Blank</Button>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 mr-2"/> Import</Button>
        <Button variant="outline" size="sm" onClick={() => setAtsOpen(true)}><Target className="w-4 h-4 mr-2"/> ATS Score</Button>
        <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5" onClick={() => setTailorOpen(true)}><Wand2 className="w-4 h-4 mr-2"/> Tailor to JD</Button>
      </AppHeader>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(420px,40%)_1fr] min-h-0">
        <aside className="overflow-y-auto p-4 lg:p-5 border-r border-slate-200/60 bg-white/40 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
          <EditorPanel/>
        </aside>
        <section className="min-h-0">
          <PreviewPanel/>
        </section>
      </div>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen}/>
      <TailorDialog open={tailorOpen} onOpenChange={setTailorOpen}/>
      <AtsScoreDialog open={atsOpen} onOpenChange={setAtsOpen}/>
    </div>
  )
}

export default App
