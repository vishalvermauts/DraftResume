'use client'
import { getTypography } from '@/lib/typography'
import { templateFontFamily } from '@/lib/templates/config'

function SectionHeader({ children, accent, style }) {
  const t = style.t
  const base = { fontSize: `${t.h2Pt}pt`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: `${t.bodyPt * 0.7}pt`, marginBottom: `${t.bodyPt * 0.4}pt` }
  switch (style.headerStyle) {
    case 'filled-bar':
      return <div style={{ ...base, background: accent, color: 'white', padding: '3pt 8pt' }}>{children}</div>
    case 'thin-underline':
      return <div style={{ ...base, color: accent, borderBottom: `0.5pt solid ${accent}`, paddingBottom: '1pt' }}>{children}</div>
    case 'thick-underline':
      return <div style={{ ...base, color: '#0f172a', borderBottom: `2pt solid ${accent}`, paddingBottom: '2pt', textAlign: style.nameAlign }}>{children}</div>
    case 'left-bar':
      return <div style={{ ...base, color: accent, borderLeft: `3pt solid ${accent}`, paddingLeft: '6pt' }}>{children}</div>
    case 'underline':
    default:
      return <div style={{ ...base, color: accent, borderBottom: `0.8pt solid ${accent}`, paddingBottom: '2pt' }}>{children}</div>
  }
}

function TitleDateRow({ left, right, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12pt' }}>
      <div style={{ flex: 1, minWidth: 0 }}>{left}</div>
      {right && <div style={{ fontSize: '0.85em', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>{right}</div>}
    </div>
  )
}

function TechStack({ text, accent }) {
  if (!text) return null
  return <div style={{ fontSize: '0.85em', fontStyle: 'italic', color: accent, marginTop: '1pt' }}>{text}</div>
}

function renderHeader(pd, accent, style) {
  const t = style.t
  const alignStyle = style.nameAlign === 'center' ? { textAlign: 'center' } : {}
  return (
    <header style={style.layout === 'header-band' ? { background: accent, color: 'white', padding: '14pt 18pt', marginBottom: '12pt' } : { ...alignStyle }}>
      <h1 style={{ fontSize: `${t.namePt}pt`, fontWeight: 700, margin: 0, color: style.layout === 'header-band' ? 'white' : '#0f172a', letterSpacing: '-0.01em' }}>{pd.fullName || 'Your Name'}</h1>
      <p style={{ fontSize: `${t.subPt}pt`, color: style.layout === 'header-band' ? 'rgba(255,255,255,0.85)' : '#64748b', marginTop: '4pt', margin: 0 }}>
        {[pd.email, pd.phone, pd.linkedin, pd.github, pd.portfolio].filter(Boolean).join('  •  ')}
      </p>
    </header>
  )
}

function RightDate(dates) {
  const s = dates.filter(Boolean).join(' – ')
  return s || null
}

function renderSummary(resume, accent, style) {
  if (!resume.professionalSummary) return null
  return (
    <section>
      <SectionHeader accent={accent} style={style}>Professional Summary</SectionHeader>
      <p style={{ margin: 0, color: '#334155' }}>{resume.professionalSummary}</p>
    </section>
  )
}
function renderEmployment(resume, accent, style) {
  if (!(resume.employmentHistory || []).length) return null
  return (
    <section>
      <SectionHeader accent={accent} style={style}>Experience</SectionHeader>
      {resume.employmentHistory.map((j, i) => (
        <div key={i} style={{ marginBottom: `${style.t.bodyPt * 0.5}pt` }}>
          <TitleDateRow accent={accent} left={(<><strong style={{ color: '#0f172a' }}>{j.jobTitle}</strong>{j.company && <span style={{ color: '#334155' }}> — {j.company}</span>}</>)} right={RightDate([j.startDate, j.endDate])} />
          {j.location && <div style={{ fontStyle: 'italic', fontSize: '0.85em', color: '#64748b' }}>{j.location}</div>}
          <ul style={{ listStyle: 'disc', paddingLeft: '14pt', margin: '2pt 0 0', color: '#334155' }}>{(j.bulletPoints || []).map((b, k) => <li key={k}>{b}</li>)}</ul>
        </div>
      ))}
    </section>
  )
}
function renderProjects(resume, accent, style) {
  if (!(resume.projects || []).length) return null
  return (
    <section>
      <SectionHeader accent={accent} style={style}>Projects</SectionHeader>
      {resume.projects.map((p, i) => (
        <div key={i} style={{ marginBottom: `${style.t.bodyPt * 0.5}pt` }}>
          <div style={{ color: '#0f172a', fontWeight: 700 }}>{p.name}</div>
          <TechStack text={p.techStack} accent={accent}/>
          <ul style={{ listStyle: 'disc', paddingLeft: '14pt', margin: '2pt 0 0', color: '#334155' }}>{(p.description || []).map((d, k) => <li key={k}>{d}</li>)}</ul>
        </div>
      ))}
    </section>
  )
}
function renderLeadership(resume, accent, style) {
  if (!(resume.leadershipVolunteering || []).length) return null
  return (
    <section>
      <SectionHeader accent={accent} style={style}>Leadership & Volunteering</SectionHeader>
      {resume.leadershipVolunteering.map((l, i) => (
        <div key={i} style={{ marginBottom: `${style.t.bodyPt * 0.5}pt` }}>
          <TitleDateRow accent={accent} left={(<><strong style={{ color: '#0f172a' }}>{l.role}</strong>{l.organization && <span style={{ color: '#334155' }}> — {l.organization}</span>}</>)} right={RightDate([l.startDate, l.endDate])} />
          <ul style={{ listStyle: 'disc', paddingLeft: '14pt', margin: '2pt 0 0', color: '#334155' }}>{(l.bulletPoints || []).map((b, k) => <li key={k}>{b}</li>)}</ul>
        </div>
      ))}
    </section>
  )
}
function renderEducation(resume, accent, style) {
  if (!(resume.education || []).length) return null
  return (
    <section>
      <SectionHeader accent={accent} style={style}>Education</SectionHeader>
      {resume.education.map((e, i) => (
        <div key={i} style={{ marginBottom: `${style.t.bodyPt * 0.4}pt` }}>
          <TitleDateRow accent={accent} left={(<strong style={{ color: '#0f172a' }}>{e.degree}{e.major && ', ' + e.major}</strong>)} right={e.endDate || null} />
          <div style={{ color: '#334155' }}>{e.school}</div>
          {e.relevantCoursework && <div style={{ fontStyle: 'italic', fontSize: '0.85em', color: '#64748b' }}>Coursework: {e.relevantCoursework}</div>}
        </div>
      ))}
    </section>
  )
}
function renderSkills(resume, accent, style) {
  const cats = Object.keys(resume.skills || {})
  if (!cats.length) return null
  return (
    <section>
      <SectionHeader accent={accent} style={style}>Skills</SectionHeader>
      {cats.map((c) => (
        <div key={c} style={{ marginBottom: '2pt' }}>
          <strong style={{ color: '#0f172a' }}>{c}: </strong><span style={{ color: '#334155' }}>{(resume.skills[c] || []).join(', ')}</span>
        </div>
      ))}
    </section>
  )
}
function renderSoftSkills(resume, accent, style) {
  if (!(resume.softSkills || []).length) return null
  return (
    <section>
      <SectionHeader accent={accent} style={style}>Soft Skills & Competencies</SectionHeader>
      <p style={{ margin: 0, color: '#334155' }}>{resume.softSkills.join(' • ')}</p>
    </section>
  )
}
function renderCerts(resume, accent, style) {
  if (!(resume.certifications || []).length) return null
  return (
    <section>
      <SectionHeader accent={accent} style={style}>Certifications</SectionHeader>
      {resume.certifications.map((c, i) => (
        <div key={i} style={{ marginBottom: '2pt' }}>
          <TitleDateRow accent={accent} left={<span style={{ color: '#334155' }}>{c.name}</span>} right={c.date || null} />
        </div>
      ))}
    </section>
  )
}
function renderCustom(resume, accent, style) {
  if (!(resume.customSections || []).length) return null
  return (
    <>
      {resume.customSections.map((cs, i) => {
        const entries = cs.entries || []
        if (!cs.title && entries.length === 0) return null
        return (
          <section key={i}>
            <SectionHeader accent={accent} style={style}>{cs.title || 'Additional'}</SectionHeader>
            {entries.map((e, k) => (
              <div key={k} style={{ marginBottom: `${style.t.bodyPt * 0.5}pt` }}>
                {(e.heading || e.subheading) && (
                  <TitleDateRow accent={accent} left={(<><strong style={{ color: '#0f172a' }}>{e.heading}</strong>{e.subheading && <span style={{ color: '#334155' }}> — {e.subheading}</span>}</>)} right={RightDate([e.startDate, e.endDate])} />
                )}
                {e.location && <div style={{ fontStyle: 'italic', fontSize: '0.85em', color: '#64748b' }}>{e.location}</div>}
                {(e.bulletPoints || []).length > 0 && <ul style={{ listStyle: 'disc', paddingLeft: '14pt', margin: '2pt 0 0', color: '#334155' }}>{e.bulletPoints.map((b, j) => <li key={j}>{b}</li>)}</ul>}
              </div>
            ))}
          </section>
        )
      })}
    </>
  )
}

const RENDERERS = {
  summary: renderSummary,
  employment: renderEmployment,
  projects: renderProjects,
  leadership: renderLeadership,
  education: renderEducation,
  skills: renderSkills,
  softSkills: renderSoftSkills,
  certifications: renderCerts,
  custom: renderCustom,
}

export default function TemplateRenderer({ resume, template, accentColor, fontSize, fontFamily, sectionOrder }) {
  const t = getTypography(fontSize)
  const style = { t, ...template, nameAlign: template.nameAlign }
  const font = fontFamily || templateFontFamily(template.font)
  const order = sectionOrder?.length ? sectionOrder : ['summary','employment','projects','leadership','education','skills','softSkills','certifications','custom']

  const containerStyle = {
    fontFamily: font,
    fontSize: `${t.bodyPt}pt`,
    lineHeight: t.line,
    color: '#1f2937',
    padding: template.layout === 'header-band' ? '0 0 40pt' : '40pt',
    boxSizing: 'border-box',
    width: '100%',
  }

  // SIDEBAR layouts: aside + main columns
  if (template.layout === 'sidebar-left' || template.layout === 'sidebar-right') {
    const sidebarSections = ['skills', 'softSkills', 'education', 'certifications']
    const mainSections = ['summary', 'employment', 'projects', 'leadership', 'custom']
    const renderSide = sidebarSections.filter((k) => RENDERERS[k] && RENDERERS[k](resume, accentColor, style)).map((k) => <div key={k}>{RENDERERS[k](resume, accentColor, style)}</div>)
    const renderMain = mainSections.filter((k) => RENDERERS[k] && RENDERERS[k](resume, accentColor, style)).map((k) => <div key={k}>{RENDERERS[k](resume, accentColor, style)}</div>)
    const cols = template.layout === 'sidebar-left' ? '1fr 2fr' : '2fr 1fr'
    return (
      <div style={containerStyle}>
        {renderHeader(resume.personalDetails || {}, accentColor, style)}
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14pt', marginTop: '8pt' }}>
          {template.layout === 'sidebar-left' ? (
            <><aside style={{ display: 'flex', flexDirection: 'column', gap: '8pt' }}>{renderSide}</aside><main style={{ display: 'flex', flexDirection: 'column', gap: '8pt' }}>{renderMain}</main></>
          ) : (
            <><main style={{ display: 'flex', flexDirection: 'column', gap: '8pt' }}>{renderMain}</main><aside style={{ display: 'flex', flexDirection: 'column', gap: '8pt' }}>{renderSide}</aside></>
          )}
        </div>
      </div>
    )
  }

  // SINGLE COLUMN layouts (including header-band)
  return (
    <div style={containerStyle}>
      {template.layout === 'header-band' ? renderHeader(resume.personalDetails || {}, accentColor, style) : <div style={{ padding: template.layout === 'header-band' ? '' : '' }}>{renderHeader(resume.personalDetails || {}, accentColor, style)}</div>}
      <div style={{ padding: template.layout === 'header-band' ? '0 40pt' : '0' }}>
        {order.map((sec) => RENDERERS[sec] ? <div key={sec}>{RENDERERS[sec](resume, accentColor, style)}</div> : null)}
      </div>
    </div>
  )
}
