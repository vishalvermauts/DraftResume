'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useResumeStore, DEFAULT_SECTION_ORDER } from '@/lib/resumeStore'
import TemplateRenderer from './templates/TemplateRenderer'
import { TEMPLATES } from '@/lib/templates/config'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Download, ZoomIn, ZoomOut, FileType2, Printer, MoveVertical } from 'lucide-react'
import { exportResumeDOCX } from '@/lib/docxExport'
import { toast } from 'sonner'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const PAGE_W = 794
const PAGE_H = 1123

const SECTION_LABELS = {
  summary: 'Professional Summary',
  employment: 'Employment History',
  projects: 'Projects',
  leadership: 'Leadership & Volunteering',
  education: 'Education',
  skills: 'Technical Skills',
  softSkills: 'Soft Skills & Competencies',
  certifications: 'Certifications',
  custom: 'Custom Sections',
}

function SortableRow({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-3 border bg-white rounded-md px-3 py-2 cursor-grab active:cursor-grabbing">
      <MoveVertical className="w-4 h-4 text-slate-400"/>
      <div className="text-sm font-medium">{SECTION_LABELS[id] || id}</div>
    </div>
  )
}

function ReorderDialog({ open, onOpenChange }) {
  const { sectionOrder, setSectionOrder } = useResumeStore()
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const items = sectionOrder?.length ? sectionOrder : DEFAULT_SECTION_ORDER
  const onDragEnd = (e) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = items.indexOf(active.id)
    const newIndex = items.indexOf(over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = [...items]
    next.splice(newIndex, 0, next.splice(oldIndex, 1)[0])
    setSectionOrder(next)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reorder Sections</DialogTitle>
          <DialogDescription>Drag to rearrange. Changes apply to single-column templates.</DialogDescription>
        </DialogHeader>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((id) => <SortableRow key={id} id={id}/>)}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setSectionOrder(DEFAULT_SECTION_ORDER)}>Reset Order</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function PreviewPanel() {
  const { resume, template, setTemplate, accentColor, setAccent, fontSize, setFontSize, sectionOrder } = useResumeStore()
  const [fontFamily, setFontFamily] = useState('')
  const [zoom, setZoom] = useState(0.78)
  const [reorderOpen, setReorderOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(PAGE_H)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!contentRef.current) return
    const measure = () => { const h = contentRef.current?.scrollHeight || PAGE_H; setContentHeight(Math.max(PAGE_H, h)) }
    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [])

  const pageCount = Math.min(20, Math.max(1, Math.ceil(contentHeight / PAGE_H)))
  const totalH = pageCount * PAGE_H
  const safeName = (resume.personalDetails?.fullName || 'resume').replace(/\s+/g, '_')
  const tmplConfig = TEMPLATES[template] || TEMPLATES.modern

  const onPrintPDF = () => {
    // Use the browser print engine - the .print-only container below renders the
    // resume in normal document flow at exact A4 width. Browser will paginate
    // automatically and produce ATS-friendly native text PDF that exactly matches preview.
    document.title = `${safeName}` // controls suggested filename
    setTimeout(() => window.print(), 50)
  }
  const onExportDOCX = async () => {
    try { await exportResumeDOCX({ resume, accentColor, fontSize, sectionOrder, filename: `${safeName}.docx` }); toast.success('Word exported.') } catch (e) { toast.error('Failed: ' + e.message) }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
        <Select value={template} onValueChange={setTemplate}>
          <SelectTrigger className="w-[200px]"><SelectValue/></SelectTrigger>
          <SelectContent>
            {Object.entries(TEMPLATES).map(([k, v]) => <SelectItem key={k} value={k}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-600">Accent</label>
          <input type="color" value={accentColor} onChange={(e) => setAccent(e.target.value)} className="w-7 h-7 rounded border"/>
        </div>
        <Select value={String(fontSize)} onValueChange={(v) => setFontSize(v)}>
          <SelectTrigger className="w-[100px]"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="9">9 pt</SelectItem>
            <SelectItem value="10">10 pt</SelectItem>
            <SelectItem value="11">11 pt</SelectItem>
            <SelectItem value="12">12 pt</SelectItem>
            <SelectItem value="13">13 pt</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fontFamily || 'auto'} onValueChange={(v) => setFontFamily(v === 'auto' ? '' : v)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Font"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (Template)</SelectItem>
            <SelectItem value="Helvetica, Arial, sans-serif">Helvetica</SelectItem>
            <SelectItem value="&quot;Times New Roman&quot;, Times, serif">Times New Roman</SelectItem>
            <SelectItem value="Georgia, serif">Georgia</SelectItem>
            <SelectItem value="&quot;Courier New&quot;, monospace">Courier New</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setReorderOpen(true)}><MoveVertical className="w-4 h-4 mr-1"/> Reorder</Button>
        <div className="flex items-center gap-1 ml-auto">
          <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}><ZoomOut className="w-4 h-4"/></Button>
          <span className="text-xs text-slate-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}><ZoomIn className="w-4 h-4"/></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-2 bg-indigo-600 hover:bg-indigo-700"><Download className="w-4 h-4 mr-2"/> Download</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPrintPDF}><Printer className="w-4 h-4 mr-2"/> Download as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={onExportDOCX}><FileType2 className="w-4 h-4 mr-2"/> Download as Word (.docx)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-slate-100/50 backdrop-blur-sm p-6 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="mx-auto" style={{ width: PAGE_W * zoom }}>
          <div className="relative origin-top" style={{ width: PAGE_W, height: totalH, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            {Array.from({ length: pageCount }).map((_, i) => (
              <div key={i} className="absolute left-0 right-0 bg-white shadow-xl" style={{ top: i * PAGE_H, height: PAGE_H }}>
                <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 select-none">Page {i + 1} of {pageCount}</div>
                {i < pageCount - 1 && <div className="absolute -bottom-px left-0 right-0 border-b-2 border-dashed border-slate-300"/>}
              </div>
            ))}
            <div ref={contentRef} className="absolute top-0 left-0 right-0">
              <TemplateRenderer resume={resume} template={tmplConfig} accentColor={accentColor} fontSize={fontSize} fontFamily={fontFamily} sectionOrder={sectionOrder}/>
            </div>
          </div>
        </div>
      </div>
      <ReorderDialog open={reorderOpen} onOpenChange={setReorderOpen}/>

      {/* Portal the print-only content directly under body root so we can fully isolate it from app layout in @media print. */}
      {mounted && document.getElementById('print-portal') && createPortal(
        <div className="print-only">
          <TemplateRenderer resume={resume} template={tmplConfig} accentColor={accentColor} fontSize={fontSize} fontFamily={fontFamily} sectionOrder={sectionOrder}/>
        </div>,
        document.getElementById('print-portal')
      )}
    </div>
  )
}
