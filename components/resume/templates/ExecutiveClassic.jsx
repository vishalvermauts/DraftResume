'use client'
import { getTypography, serifStack } from '@/lib/typography'

export default function ExecutiveClassic({ resume, accentColor, fontSize }) {
  const t = getTypography(fontSize)
  const pd = resume.personalDetails || {}
  const skillCats = Object.keys(resume.skills || {})

  const container = { fontFamily: serifStack, fontSize: `${t.bodyPt}pt`, lineHeight: t.line, color: '#1f2937', padding: '36pt 32pt', boxSizing: 'border-box' }
  const nameStyle = { fontSize: `${t.namePt + 2}pt`, fontWeight: 700, color: '#0f172a', textAlign: 'center', margin: 0 }
  const contactStyle = { fontSize: `${t.subPt}pt`, color: '#475569', textAlign: 'center', marginTop: '4pt' }
  const SH = ({ children }) => (
    <div style={{ background: accentColor, color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: `${t.h2Pt}pt`, padding: '3pt 6pt' }}>{children}</div>
  )
  const titleRow = { display: 'flex', justifyContent: 'space-between', gap: '8pt', alignItems: 'baseline' }
  const subStyle = { fontSize: `${t.subPt}pt`, color: '#64748b' }
  const bulletList = { listStyle: 'disc', paddingLeft: '14pt', margin: '2pt 0 0' }
  const blockStyle = { marginBottom: `${t.bodyPt * 0.5}pt` }

  return (
    <div style={container}>
      <header style={{ borderBottom: `2pt solid ${accentColor}`, paddingBottom: '6pt' }}>
        <h1 style={nameStyle}>{pd.fullName || 'Your Name'}</h1>
        <p style={contactStyle}>{[pd.email, pd.phone, pd.linkedin, pd.github, pd.portfolio].filter(Boolean).join('  •  ')}</p>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14pt', marginTop: '12pt' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '10pt' }}>
          {skillCats.length > 0 && (
            <div>
              <SH>Skills</SH>
              <div style={{ marginTop: '4pt' }}>
                {skillCats.map((c) => (
                  <div key={c} style={{ marginBottom: '4pt' }}>
                    <strong style={{ color: '#0f172a' }}>{c}</strong>
                    <div style={{ color: '#334155' }}>{(resume.skills[c] || []).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(resume.softSkills || []).length > 0 && (
            <div>
              <SH>Soft Skills</SH>
              <div style={{ marginTop: '4pt', color: '#334155' }}>{resume.softSkills.join(' • ')}</div>
            </div>
          )}
          {(resume.education || []).length > 0 && (
            <div>
              <SH>Education</SH>
              <div style={{ marginTop: '4pt' }}>
                {resume.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: '4pt' }}>
                    <strong style={{ color: '#0f172a' }}>{e.degree}{e.major && ', ' + e.major}</strong>
                    <div style={{ color: '#334155' }}>{e.school}</div>
                    <div style={subStyle}>{e.endDate}</div>
                    {e.relevantCoursework && <div style={{ ...subStyle, fontStyle: 'italic' }}>{e.relevantCoursework}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(resume.certifications || []).length > 0 && (
            <div>
              <SH>Certifications</SH>
              <ul style={bulletList}>{resume.certifications.map((c, i) => <li key={i}>{c.name}{c.date && ` (${c.date})`}</li>)}</ul>
            </div>
          )}
        </aside>
        <main style={{ display: 'flex', flexDirection: 'column', gap: '10pt' }}>
          {resume.professionalSummary && (
            <div>
              <SH>Profile</SH>
              <p style={{ margin: '4pt 0 0', color: '#334155' }}>{resume.professionalSummary}</p>
            </div>
          )}
          {(resume.employmentHistory || []).length > 0 && (
            <div>
              <SH>Experience</SH>
              <div style={{ marginTop: '4pt' }}>
                {resume.employmentHistory.map((j, i) => (
                  <div key={i} style={blockStyle}>
                    <div style={titleRow}>
                      <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{j.jobTitle}</strong></div>
                      <div style={{ ...subStyle, whiteSpace: 'nowrap' }}>{[j.startDate, j.endDate].filter(Boolean).join(' – ')}</div>
                    </div>
                    <div style={{ fontStyle: 'italic', color: '#334155' }}>{j.company}{j.location && ' — ' + j.location}</div>
                    <ul style={bulletList}>{(j.bulletPoints || []).map((b, k) => <li key={k}>{b}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(resume.projects || []).length > 0 && (
            <div>
              <SH>Projects</SH>
              <div style={{ marginTop: '4pt' }}>
                {resume.projects.map((p, i) => (
                  <div key={i} style={blockStyle}>
                    <div style={titleRow}>
                      <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{p.name}</strong></div>
                      <div style={{ ...subStyle, fontStyle: 'italic' }}>{p.techStack}</div>
                    </div>
                    <ul style={bulletList}>{(p.description || []).map((d, k) => <li key={k}>{d}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(resume.leadershipVolunteering || []).length > 0 && (
            <div>
              <SH>Leadership & Volunteering</SH>
              <div style={{ marginTop: '4pt' }}>
                {resume.leadershipVolunteering.map((l, i) => (
                  <div key={i} style={blockStyle}>
                    <div style={titleRow}>
                      <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{l.role}</strong></div>
                      <div style={{ ...subStyle, whiteSpace: 'nowrap' }}>{[l.startDate, l.endDate].filter(Boolean).join(' – ')}</div>
                    </div>
                    <div style={{ fontStyle: 'italic', color: '#334155' }}>{l.organization}</div>
                    <ul style={bulletList}>{(l.bulletPoints || []).map((b, k) => <li key={k}>{b}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(resume.customSections || []).map((cs, i) => {
            const entries = cs.entries || []
            if (!cs.title && entries.length === 0) return null
            return (
              <div key={i}>
                <SH>{cs.title || 'Additional'}</SH>
                <div style={{ marginTop: '4pt' }}>
                  {entries.map((e, k) => (
                    <div key={k} style={blockStyle}>
                      {(e.heading || e.subheading) && (
                        <div style={titleRow}>
                          <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: '#0f172a' }}>{e.heading}</strong></div>
                          <div style={{ ...subStyle, whiteSpace: 'nowrap' }}>{[e.startDate, e.endDate].filter(Boolean).join(' – ')}</div>
                        </div>
                      )}
                      {e.subheading && <div style={{ fontStyle: 'italic', color: '#334155' }}>{e.subheading}{e.location && ' — ' + e.location}</div>}
                      {(e.bulletPoints || []).length > 0 && (
                        <ul style={bulletList}>{e.bulletPoints.map((b, j) => <li key={j}>{b}</li>)}</ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </main>
      </div>
    </div>
  )
}
