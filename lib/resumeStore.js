'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

export const emptyResume = {
  personalDetails: { fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' },
  professionalSummary: '',
  employmentHistory: [],
  projects: [],
  education: [],
  skills: {},
  softSkills: [],
  certifications: [],
  leadershipVolunteering: [],
  customSections: [],
}

export const DEFAULT_SECTION_ORDER = [
  'summary','employment','projects','leadership','education','skills','softSkills','certifications','custom',
]

// Helper to coerce legacy customSections (bulletPoints) into new entries-based shape
export function normalizeResume(r) {
  const out = { ...emptyResume, ...r }
  out.customSections = (r?.customSections || []).map((cs) => ({
    title: cs.title || '',
    entries: Array.isArray(cs.entries) && cs.entries.length
      ? cs.entries
      : (Array.isArray(cs.bulletPoints) && cs.bulletPoints.length
          ? [{ heading: '', subheading: '', location: '', startDate: '', endDate: '', bulletPoints: cs.bulletPoints }]
          : []),
  }))
  return out
}

export const sampleResume = {
  personalDetails: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    portfolio: 'alexmorgan.dev',
  },
  professionalSummary:
    'Full-stack software engineer with 6+ years of experience designing scalable web platforms and shipping AI-powered products. Proven track record of leading cross-functional teams and delivering measurable business impact.',
  employmentHistory: [
    { jobTitle: 'Senior Software Engineer', company: 'Northwind Labs', location: 'San Francisco, CA', startDate: '03/2022', endDate: 'Present', bulletPoints: [
      'Led migration of legacy monolith to a Next.js + Node microservices architecture, reducing p95 latency by 42%.',
      'Designed an internal LLM tooling platform used by 200+ engineers, automating 15+ recurring workflows.',
      'Mentored 4 junior engineers, instituting code review standards that cut defect rate by 30%.',
    ]},
    { jobTitle: 'Software Engineer', company: 'Brightwave', location: 'Remote', startDate: '06/2019', endDate: '02/2022', bulletPoints: [
      'Built customer analytics dashboard in React/TypeScript serving 50k MAU.',
      'Optimized PostgreSQL queries and added Redis caching to halve average API response time.',
    ]},
  ],
  projects: [
    { name: 'PromptForge', techStack: 'Next.js, OpenAI, PostgreSQL', description: [
      'Open-source playground for testing and versioning LLM prompts, 2.4k GitHub stars.',
      'Implemented diff-based evaluation runner to benchmark prompt variants automatically.',
    ]},
  ],
  education: [
    { degree: 'B.S.', major: 'Computer Science', school: 'University of Washington', endDate: '2019', relevantCoursework: 'Distributed Systems, Algorithms, Machine Learning' },
  ],
  skills: {
    Languages: ['TypeScript', 'JavaScript', 'Python', 'Go'],
    Frameworks: ['React', 'Next.js', 'Node.js', 'FastAPI'],
    Infrastructure: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'],
  },
  softSkills: ['Cross-functional Leadership', 'Stakeholder Communication', 'Mentorship', 'Problem Solving'],
  certifications: [ { name: 'AWS Certified Solutions Architect – Associate', date: '2023' } ],
  leadershipVolunteering: [
    { role: 'Volunteer Mentor', organization: 'Code Nation', startDate: '01/2021', endDate: 'Present', bulletPoints: [
      'Mentored 12 high-school students through 10-week intro to web development bootcamp.',
    ]},
  ],
  customSections: [],
}

export const useResumeStore = create(
  persist(
    (set, get) => ({
      resume: sampleResume,
      template: 'modern',
      accentColor: '#4f46e5',
      fontSize: '11',
      provider: 'anthropic',
      apiKey: '',
      model: '',
      sectionOrder: DEFAULT_SECTION_ORDER,
      lastJobDescription: '',
      lastJobCompany: '',
      lastJobRole: '',
      coverLetter: '',
      setResume: (r) => set({ resume: normalizeResume(r) }),
      patch: (updater) => set({ resume: updater(get().resume) }),
      setTemplate: (t) => set({ template: t }),
      setAccent: (c) => set({ accentColor: c }),
      setFontSize: (s) => set({ fontSize: s }),
      setProvider: (p) => set({ provider: p }),
      setApiKey: (k) => set({ apiKey: k }),
      setModel: (m) => set({ model: m }),
      setSectionOrder: (o) => set({ sectionOrder: o }),
      setLastJD: (jd, company = '', role = '') => set({ lastJobDescription: jd, lastJobCompany: company || get().lastJobCompany, lastJobRole: role || get().lastJobRole }),
      setLastJobCompany: (v) => set({ lastJobCompany: v }),
      setLastJobRole: (v) => set({ lastJobRole: v }),
      setCoverLetter: (t) => set({ coverLetter: t }),
      reset: () => set({ resume: emptyResume }),
      loadFromCloud: async (userId) => {
        const supabase = createClient()
        const { data, error } = await supabase.from('resumes').select('resume_data').eq('user_id', userId).single()
        if (error && error.code !== 'PGRST116') throw error // PGRST116 means 0 rows, which is ok for new users
        if (data?.resume_data) {
          set({ resume: normalizeResume(data.resume_data) })
        }
      },
      saveToCloud: async (userId, currentResume) => {
        const supabase = createClient()
        const { error } = await supabase.from('resumes').upsert({
          user_id: userId,
          resume_data: currentResume,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        if (error) throw error
      },
    }),
    {
      name: 'ai-resume-builder',
      partialize: (s) => ({
        resume: s.resume, template: s.template, accentColor: s.accentColor, fontSize: s.fontSize,
        provider: s.provider, apiKey: s.apiKey, model: s.model, sectionOrder: s.sectionOrder,
        lastJobDescription: s.lastJobDescription, lastJobCompany: s.lastJobCompany, lastJobRole: s.lastJobRole,
        coverLetter: s.coverLetter,
      }),
    }
  )
)
