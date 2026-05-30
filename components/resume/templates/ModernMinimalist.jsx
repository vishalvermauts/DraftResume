'use client'
import { getTypography, sansStack } from '@/lib/typography'

export default function ModernMinimalist({ resume, accentColor, fontSize, sectionOrder }) {
  const t = getTypography(fontSize)
  const pd = resume.personalDetails || {}
  const skillCats = Object.keys(resume.skills || {})
  const order = sectionOrder?.length ? sectionOrder : ['summary','employment','projects','leadership','education','skills','softSkills','certifications','custom']

  const containerStyle = {
    fontFamily: sansStack,
    fontSize: `${t.bodyPt}pt`,
    lineHeight: t.line,
    color: '#1f2937',
    padding: `${t.marginPt}pt`,
    boxSizing: 'border-box',
  }
  const nameStyle = { fontSize: `${t.namePt}pt`, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', margin: 0 }
  const contactStyle = { fontSize: `${t.subPt}pt`, color: '#64748b', marginTop: '4pt' }
  const sectionTitleStyle = { fontSize: `${t.h2Pt}pt`, fontWeight: 700, color: accentColor, letterSpacing: '0.18em', textTransform: 'uppercase', borderBottom: `0.8pt solid ${accentColor}`, paddingBottom: '2pt', marginTop: `${t.bodyPt * 0.6}pt`, marginBottom: '6pt' }
  const subStyle = { fontSize: `${t.subPt}pt`, color: '#64748b' }
  const bulletList = { listStyle: 'disc', paddingLeft: '14pt', margin: '2pt 0 0' }
  const itemSpacing = { marginBottom: `${t.bodyPt * 0.4}pt` }
  const titleRow = { display: 'flex', justifyContent: 'space-between', gap: '8pt', alignItems: 'baseline' }

  const renderSection = (sec) => {
    if (sec === 'summary' && resume.professionalSummary) return (
      <section key={sec}>
        <h2 style={sectionTitleStyle}>Professional Summary</h2>
        <p style={{ margin: 0, color: '#334155' }}>{resume.professionalSummary}</p>
      </section>
    )
    if (sec === 'employment' && (resume.employmentHistory || []).length) return (
      <section key={sec}>
        <h2 style={sectionTitleStyle}>Experience</h2>
        {resume.employmentHistory.map((j, i) => (
          <div key={i} style={itemSpacing}>
            <div style={titleRow}>
              <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{j.jobTitle}</strong>{j.company && <span style={{ color: '#334155' }}> — {j.company}</span>}</div>
              <div style={{ ...subStyle, whiteSpace: 'nowrap' }}>{[j.startDate, j.endDate].filter(Boolean).join(' – ')}</div>
            </div>
            {j.location && <div style={{ ...subStyle, fontStyle: 'italic' }}>{j.location}</div>}
            <ul style={bulletList}>{(j.bulletPoints || []).map((b, k) => <li key={k}>{b}</li>)}</ul>
          </div>
        ))}
      </section>
    )
    if (sec === 'projects' && (resume.projects || []).length) return (
      <section key={sec}>
        <h2 style={sectionTitleStyle}>Projects</h2>
        {resume.projects.map((p, i) => (
          <div key={i} style={itemSpacing}>
            <div style={titleRow}>
              <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{p.name}</strong></div>
              <div style={{ ...subStyle, fontStyle: 'italic' }}>{p.techStack}</div>
            </div>
            <ul style={bulletList}>{(p.description || []).map((d, k) => <li key={k}>{d}</li>)}</ul>
          </div>
        ))}
      </section>
    )
    if (sec === 'leadership' && (resume.leadershipVolunteering || []).length) return (
      <section key={sec}>
        <h2 style={sectionTitleStyle}>Leadership & Volunteering</h2>
        {resume.leadershipVolunteering.map((l, i) => (
          <div key={i} style={itemSpacing}>
            <div style={titleRow}>
              <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{l.role}</strong>{l.organization && <span style={{ color: '#334155' }}> — {l.organization}</span>}</div>
              <div style={{ ...subStyle, whiteSpace: 'nowrap' }}>{[l.startDate, l.endDate].filter(Boolean).join(' – ')}</div>
            </div>
            <ul style={bulletList}>{(l.bulletPoints || []).map((b, k) => <li key={k}>{b}</li>)}</ul>
          </div>
        ))}
      </section>
    )
    if (sec === 'education' && (resume.education || []).length) return (
      <section key={sec}>
        <h2 style={sectionTitleStyle}>Education</h2>
        {resume.education.map((e, i) => (
          <div key={i} style={itemSpacing}>
            <div style={titleRow}>
              <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{e.degree}{e.major && ', ' + e.major}</strong></div>
              <div style={{ ...subStyle }}>{e.endDate}</div>
            </div>
            <div style={{ color: '#334155' }}>{e.school}</div>
            {e.relevantCoursework && <div style={{ ...subStyle, fontStyle: 'italic' }}>Coursework: {e.relevantCoursework}</div>}
          </div>
        ))}
      </section>
    )
    if (sec === 'skills' && skillCats.length) return (
      <section key={sec}>
        <h2 style={sectionTitleStyle}>Skills</h2>
        {skillCats.map((c) => (
          <div key={c} style={{ marginBottom: '2pt' }}>
            <strong style={{ color: '#0f172a' }}>{c}: </strong><span style={{ color: '#334155' }}>{(resume.skills[c] || []).join(', ')}</span>
          </div>
        ))}
      </section>
    )
    if (sec === 'softSkills' && (resume.softSkills || []).length) return (
      <section key={sec}>
        <h2 style={sectionTitleStyle}>Soft Skills & Competencies</h2>
        <p style={{ margin: 0, color: '#334155' }}>{resume.softSkills.join(' • ')}</p>
      </section>
    )
    if (sec === 'certifications' && (resume.certifications || []).length) return (
      <section key={sec}>
        <h2 style={sectionTitleStyle}>Certifications</h2>
        <ul style={bulletList}>
          {resume.certifications.map((c, i) => (<li key={i}>{c.name}{c.date && ` (${c.date})`}</li>))}
        </ul>
      </section>
    )
    if (sec === 'custom' && (resume.customSections || []).length) return (
      <div key={sec}>
        {resume.customSections.map((cs, i) => {
          const entries = cs.entries || []
          if (!cs.title && entries.length === 0) return null
          return (
            <section key={i}>
              <h2 style={sectionTitleStyle}>{cs.title || 'Additional'}</h2>
              {entries.map((e, k) => (
                <div key={k} style={itemSpacing}>
                  {(e.heading || e.subheading) && (
                    <div style={titleRow}>
                      <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{e.heading}</strong>{e.subheading && <span style={{ color: '#334155' }}> — {e.subheading}</span>}</div>
                      <div style={{ ...subStyle, whiteSpace: 'nowrap' }}>{[e.startDate, e.endDate].filter(Boolean).join(' – ')}</div>
                    </div>
                  )}
                  {e.location && <div style={{ ...subStyle, fontStyle: 'italic' }}>{e.location}</div>}
                  {(e.bulletPoints || []).length > 0 && (
                    <ul style={bulletList}>{e.bulletPoints.map((b, j) => <li key={j}>{b}</li>)}</ul>
                  )}
                </div>
              ))}
            </section>
          )
        })}
      </div>
    )
    return null
  }

  return (
    <div style={containerStyle}>
      <header>
        <h1 style={nameStyle}>{pd.fullName || 'Your Name'}</h1>
        <p style={contactStyle}>{[pd.email, pd.phone, pd.linkedin, pd.github, pd.portfolio].filter(Boolean).join('  •  ')}</p>
      </header>
      {order.map(renderSection)}
    </div>
  )
}
