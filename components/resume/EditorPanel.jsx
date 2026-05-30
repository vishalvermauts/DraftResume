'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useResumeStore } from '@/lib/resumeStore'
import { Plus, Trash2 } from 'lucide-react'

function Field({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-600">{label}</Label>
      <Input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export default function EditorPanel() {
  const { resume, patch } = useResumeStore()
  const pd = resume.personalDetails || {}

  const setPD = (k, v) => patch((r) => ({ ...r, personalDetails: { ...r.personalDetails, [k]: v } }))
  const setSummary = (v) => patch((r) => ({ ...r, professionalSummary: v }))

  // Generic list helpers
  const setItem = (key) => (i, k, v) => patch((r) => { const arr = [...(r[key] || [])]; arr[i] = { ...arr[i], [k]: v }; return { ...r, [key]: arr } })
  const addItem = (key, tmpl) => patch((r) => ({ ...r, [key]: [...(r[key] || []), tmpl] }))
  const delItem = (key) => (i) => patch((r) => ({ ...r, [key]: (r[key] || []).filter((_, x) => x !== i) }))
  const setSubArr = (key, sub) => (i, j, v) => patch((r) => { const arr = [...(r[key] || [])]; const bps = [...(arr[i][sub] || [])]; bps[j] = v; arr[i] = { ...arr[i], [sub]: bps }; return { ...r, [key]: arr } })
  const addSubArr = (key, sub) => (i) => patch((r) => { const arr = [...(r[key] || [])]; arr[i] = { ...arr[i], [sub]: [...(arr[i][sub] || []), ''] }; return { ...r, [key]: arr } })
  const delSubArr = (key, sub) => (i, j) => patch((r) => { const arr = [...(r[key] || [])]; arr[i] = { ...arr[i], [sub]: arr[i][sub].filter((_, x) => x !== j) }; return { ...r, [key]: arr } })

  const setEmp = setItem('employmentHistory')
  const addEmp = () => addItem('employmentHistory', { jobTitle: '', company: '', location: '', startDate: '', endDate: '', bulletPoints: [''] })
  const delEmp = delItem('employmentHistory')
  const setEmpBullet = setSubArr('employmentHistory', 'bulletPoints')
  const addEmpBullet = addSubArr('employmentHistory', 'bulletPoints')
  const delEmpBullet = delSubArr('employmentHistory', 'bulletPoints')

  const setProj = setItem('projects')
  const addProj = () => addItem('projects', { name: '', techStack: '', description: [''] })
  const delProj = delItem('projects')
  const setProjDesc = setSubArr('projects', 'description')
  const addProjDesc = addSubArr('projects', 'description')
  const delProjDesc = delSubArr('projects', 'description')

  const setLead = setItem('leadershipVolunteering')
  const addLead = () => addItem('leadershipVolunteering', { role: '', organization: '', startDate: '', endDate: '', bulletPoints: [''] })
  const delLead = delItem('leadershipVolunteering')
  const setLeadBullet = setSubArr('leadershipVolunteering', 'bulletPoints')
  const addLeadBullet = addSubArr('leadershipVolunteering', 'bulletPoints')
  const delLeadBullet = delSubArr('leadershipVolunteering', 'bulletPoints')

  const setEdu = setItem('education')
  const addEdu = () => addItem('education', { degree: '', major: '', school: '', endDate: '', relevantCoursework: '' })
  const delEdu = delItem('education')

  const setCert = setItem('certifications')
  const addCert = () => addItem('certifications', { name: '', date: '' })
  const delCert = delItem('certifications')

  const skillCats = Object.keys(resume.skills || {})
  const renameSkillCat = (oldKey, newKey) => patch((r) => {
    if (!newKey || newKey === oldKey) return r
    const next = {}
    for (const k of Object.keys(r.skills)) next[k === oldKey ? newKey : k] = r.skills[k]
    return { ...r, skills: next }
  })
  const setSkillValues = (cat, csv) => patch((r) => ({ ...r, skills: { ...r.skills, [cat]: csv.split(',').map(s => s.trim()).filter(Boolean) } }))
  const addSkillCat = () => patch((r) => ({ ...r, skills: { ...r.skills, [`Category ${Object.keys(r.skills).length + 1}`]: [] } }))
  const delSkillCat = (cat) => patch((r) => { const s = { ...r.skills }; delete s[cat]; return { ...r, skills: s } })

  const setSoftSkills = (csv) => patch((r) => ({ ...r, softSkills: csv.split(',').map(s => s.trim()).filter(Boolean) }))

  const setCustom = setItem('customSections')
  const addCustom = () => addItem('customSections', { title: 'Additional', entries: [{ heading: '', subheading: '', location: '', startDate: '', endDate: '', bulletPoints: [''] }] })
  const delCustom = delItem('customSections')
  const setCustomEntry = (i, j, k, v) => patch((r) => {
    const arr = [...(r.customSections || [])]; const entries = [...(arr[i].entries || [])]; entries[j] = { ...entries[j], [k]: v }
    arr[i] = { ...arr[i], entries }; return { ...r, customSections: arr }
  })
  const addCustomEntry = (i) => patch((r) => { const arr = [...(r.customSections || [])]; arr[i] = { ...arr[i], entries: [...(arr[i].entries || []), { heading: '', subheading: '', location: '', startDate: '', endDate: '', bulletPoints: [''] }] }; return { ...r, customSections: arr } })
  const delCustomEntry = (i, j) => patch((r) => { const arr = [...(r.customSections || [])]; arr[i] = { ...arr[i], entries: (arr[i].entries || []).filter((_, x) => x !== j) }; return { ...r, customSections: arr } })
  const setCustomBullet = (i, j, k, v) => patch((r) => {
    const arr = [...(r.customSections || [])]; const entries = [...(arr[i].entries || [])]; const bps = [...(entries[j].bulletPoints || [])]; bps[k] = v
    entries[j] = { ...entries[j], bulletPoints: bps }; arr[i] = { ...arr[i], entries }; return { ...r, customSections: arr }
  })
  const addCustomBullet = (i, j) => patch((r) => { const arr = [...(r.customSections || [])]; const entries = [...(arr[i].entries || [])]; entries[j] = { ...entries[j], bulletPoints: [...(entries[j].bulletPoints || []), ''] }; arr[i] = { ...arr[i], entries }; return { ...r, customSections: arr } })
  const delCustomBullet = (i, j, k) => patch((r) => { const arr = [...(r.customSections || [])]; const entries = [...(arr[i].entries || [])]; entries[j] = { ...entries[j], bulletPoints: (entries[j].bulletPoints || []).filter((_, x) => x !== k) }; arr[i] = { ...arr[i], entries }; return { ...r, customSections: arr } })

  return (
    <Accordion type="multiple" defaultValue={[ 'personal', 'summary', 'employment' ]} className="space-y-2">
      <AccordionItem value="personal" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Personal Details</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-1 pb-3">
          <Field label="Full Name" value={pd.fullName} onChange={(v) => setPD('fullName', v)} placeholder="Jane Doe"/>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={pd.email} onChange={(v) => setPD('email', v)} placeholder="jane@example.com"/>
            <Field label="Phone" value={pd.phone} onChange={(v) => setPD('phone', v)} placeholder="+1 ..."/>
          </div>
          <Field label="LinkedIn" value={pd.linkedin} onChange={(v) => setPD('linkedin', v)} placeholder="linkedin.com/in/..."/>
          <div className="grid grid-cols-2 gap-3">
            <Field label="GitHub" value={pd.github} onChange={(v) => setPD('github', v)} placeholder="github.com/..."/>
            <Field label="Portfolio" value={pd.portfolio} onChange={(v) => setPD('portfolio', v)} placeholder="yourdomain.com"/>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="summary" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Professional Summary</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3">
          <Textarea value={resume.professionalSummary || ''} onChange={(e) => setSummary(e.target.value)} placeholder="3-4 sentence elevator pitch..." className="min-h-[110px]"/>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="employment" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Employment History</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3 space-y-4">
          {(resume.employmentHistory || []).map((job, i) => (
            <div key={i} className="border rounded-md p-3 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Job #{i+1}</div>
                <Button variant="ghost" size="sm" onClick={() => delEmp(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Job Title" value={job.jobTitle} onChange={(v) => setEmp(i, 'jobTitle', v)}/>
                <Field label="Company" value={job.company} onChange={(v) => setEmp(i, 'company', v)}/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Location" value={job.location} onChange={(v) => setEmp(i, 'location', v)}/>
                <Field label="Start (MM/YYYY)" value={job.startDate} onChange={(v) => setEmp(i, 'startDate', v)}/>
                <Field label="End (MM/YYYY or Present)" value={job.endDate} onChange={(v) => setEmp(i, 'endDate', v)}/>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Bullet Points</Label>
                {(job.bulletPoints || []).map((bp, j) => (
                  <div key={j} className="flex gap-2 items-start">
                    <Textarea value={bp} onChange={(e) => setEmpBullet(i, j, e.target.value)} className="min-h-[60px]"/>
                    <Button variant="ghost" size="sm" onClick={() => delEmpBullet(i, j)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addEmpBullet(i)}><Plus className="w-3.5 h-3.5 mr-1"/> Add Bullet</Button>
              </div>
            </div>
          ))}
          <Button onClick={addEmp} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-1"/> Add Employment</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="projects" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Projects</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3 space-y-4">
          {(resume.projects || []).map((p, i) => (
            <div key={i} className="border rounded-md p-3 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Project #{i+1}</div>
                <Button variant="ghost" size="sm" onClick={() => delProj(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={p.name} onChange={(v) => setProj(i, 'name', v)}/>
                <Field label="Tech Stack" value={p.techStack} onChange={(v) => setProj(i, 'techStack', v)}/>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Description Points</Label>
                {(p.description || []).map((d, j) => (
                  <div key={j} className="flex gap-2 items-start">
                    <Textarea value={d} onChange={(e) => setProjDesc(i, j, e.target.value)} className="min-h-[55px]"/>
                    <Button variant="ghost" size="sm" onClick={() => delProjDesc(i, j)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addProjDesc(i)}><Plus className="w-3.5 h-3.5 mr-1"/> Add Point</Button>
              </div>
            </div>
          ))}
          <Button onClick={addProj} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-1"/> Add Project</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="leadership" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Leadership &amp; Volunteering</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3 space-y-4">
          {(resume.leadershipVolunteering || []).map((l, i) => (
            <div key={i} className="border rounded-md p-3 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Entry #{i+1}</div>
                <Button variant="ghost" size="sm" onClick={() => delLead(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role" value={l.role} onChange={(v) => setLead(i, 'role', v)}/>
                <Field label="Organization" value={l.organization} onChange={(v) => setLead(i, 'organization', v)}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start (MM/YYYY)" value={l.startDate} onChange={(v) => setLead(i, 'startDate', v)}/>
                <Field label="End (MM/YYYY or Present)" value={l.endDate} onChange={(v) => setLead(i, 'endDate', v)}/>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Bullet Points</Label>
                {(l.bulletPoints || []).map((b, j) => (
                  <div key={j} className="flex gap-2 items-start">
                    <Textarea value={b} onChange={(e) => setLeadBullet(i, j, e.target.value)} className="min-h-[55px]"/>
                    <Button variant="ghost" size="sm" onClick={() => delLeadBullet(i, j)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addLeadBullet(i)}><Plus className="w-3.5 h-3.5 mr-1"/> Add Bullet</Button>
              </div>
            </div>
          ))}
          <Button onClick={addLead} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-1"/> Add Leadership / Volunteering</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="education" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Education</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3 space-y-4">
          {(resume.education || []).map((ed, i) => (
            <div key={i} className="border rounded-md p-3 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Education #{i+1}</div>
                <Button variant="ghost" size="sm" onClick={() => delEdu(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Degree" value={ed.degree} onChange={(v) => setEdu(i, 'degree', v)}/>
                <Field label="Major" value={ed.major} onChange={(v) => setEdu(i, 'major', v)}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="School" value={ed.school} onChange={(v) => setEdu(i, 'school', v)}/>
                <Field label="End Date" value={ed.endDate} onChange={(v) => setEdu(i, 'endDate', v)}/>
              </div>
              <Field label="Relevant Coursework" value={ed.relevantCoursework} onChange={(v) => setEdu(i, 'relevantCoursework', v)}/>
            </div>
          ))}
          <Button onClick={addEdu} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-1"/> Add Education</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="skills" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Technical Skills</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3 space-y-3">
          {skillCats.map((cat) => (
            <div key={cat} className="border rounded-md p-3 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2">
                <Input defaultValue={cat} onBlur={(e) => renameSkillCat(cat, e.target.value)} className="max-w-[200px] font-semibold"/>
                <Button variant="ghost" size="sm" onClick={() => delSkillCat(cat)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
              <Textarea
                defaultValue={(resume.skills[cat] || []).join(', ')}
                onBlur={(e) => setSkillValues(cat, e.target.value)}
                placeholder="Comma-separated, e.g. React, Next.js, TypeScript"
                className="min-h-[55px]"
              />
            </div>
          ))}
          <Button onClick={addSkillCat} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-1"/> Add Skill Category</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="softSkills" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Soft Skills &amp; Competencies</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3">
          <Textarea
            defaultValue={(resume.softSkills || []).join(', ')}
            onBlur={(e) => setSoftSkills(e.target.value)}
            placeholder="Comma-separated, e.g. Leadership, Communication, Critical Thinking"
            className="min-h-[60px]"
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="certs" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Certifications</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3 space-y-3">
          {(resume.certifications || []).map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_auto] gap-2 items-end border rounded-md p-3 bg-slate-50">
              <Field label="Certification" value={c.name} onChange={(v) => setCert(i, 'name', v)}/>
              <Field label="Date" value={c.date} onChange={(v) => setCert(i, 'date', v)}/>
              <Button variant="ghost" size="sm" onClick={() => delCert(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
            </div>
          ))}
          <Button onClick={addCert} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-1"/> Add Certification</Button>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="custom" className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-xl px-4 transition-all hover:shadow-md">
        <AccordionTrigger className="text-sm font-semibold">Custom Sections</AccordionTrigger>
        <AccordionContent className="pt-1 pb-3 space-y-4">
          {(resume.customSections || []).map((cs, i) => (
            <div key={i} className="border rounded-md p-3 space-y-3 bg-slate-50">
              <div className="flex items-end justify-between gap-2">
                <Field label="Section Title" value={cs.title} onChange={(v) => setCustom(i, 'title', v)} placeholder="e.g. Publications, Awards, Languages"/>
                <Button variant="ghost" size="sm" onClick={() => delCustom(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
              <div className="space-y-3">
                {(cs.entries || []).map((e, j) => (
                  <div key={j} className="border rounded-md p-3 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">Entry #{j+1}</div>
                      <Button variant="ghost" size="sm" onClick={() => delCustomEntry(i, j)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Heading" value={e.heading} onChange={(v) => setCustomEntry(i, j, 'heading', v)} placeholder="e.g. Award name / Title"/>
                      <Field label="Subheading" value={e.subheading} onChange={(v) => setCustomEntry(i, j, 'subheading', v)} placeholder="Issuer / Org / Venue"/>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Location" value={e.location} onChange={(v) => setCustomEntry(i, j, 'location', v)}/>
                      <Field label="Start (MM/YYYY)" value={e.startDate} onChange={(v) => setCustomEntry(i, j, 'startDate', v)}/>
                      <Field label="End (MM/YYYY or Present)" value={e.endDate} onChange={(v) => setCustomEntry(i, j, 'endDate', v)}/>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Bullet Points</Label>
                      {(e.bulletPoints || []).map((b, k) => (
                        <div key={k} className="flex gap-2 items-start">
                          <Textarea value={b} onChange={(ev) => setCustomBullet(i, j, k, ev.target.value)} className="min-h-[55px]"/>
                          <Button variant="ghost" size="sm" onClick={() => delCustomBullet(i, j, k)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addCustomBullet(i, j)}><Plus className="w-3.5 h-3.5 mr-1"/> Add Bullet</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addCustomEntry(i)} className="w-full"><Plus className="w-3.5 h-3.5 mr-1"/> Add Entry</Button>
              </div>
            </div>
          ))}
          <Button onClick={addCustom} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-1"/> Add Custom Section</Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
