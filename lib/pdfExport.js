'use client'
import jsPDF from 'jspdf'

function hexToRgb(hex) {
  const h = (hex || '#4f46e5').replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const FS = {
  '10': { name: 18, h2: 10, body: 10, sub: 9, line: 1.3 },
  '11': { name: 20, h2: 11, body: 11, sub: 10, line: 1.32 },
  '12': { name: 22, h2: 12, body: 12, sub: 10, line: 1.34 },
}

export function exportResumePDF({ resume, template, accentColor, fontSize, sectionOrder, filename = 'resume.pdf' }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const sizes = FS[String(fontSize)] || FS['11']
  const [ar, ag, ab] = hexToRgb(accentColor)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M = 40

  if (template === 'executive') {
    return renderExecutive({ doc, resume, sizes, ar, ag, ab, pageW, pageH, M, sectionOrder, filename })
  }
  return renderModern({ doc, resume, sizes, ar, ag, ab, pageW, pageH, M, sectionOrder, filename })
}

function setFont(doc, style, size, color = [30, 30, 30]) {
  doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(color[0], color[1], color[2])
}

function ensureSpace(state, need) {
  if (state.y + need > state.pageH - state.M) {
    state.doc.addPage(); state.y = state.M
  }
}

function drawTitleWithRightDate(state, leftText, leftStyle, leftSize, rightText) {
  const { doc, M, pageW } = state
  // measure right text first
  let rightW = 0
  if (rightText) {
    setFont(doc, 'normal', state.sizes.sub, [100, 100, 100])
    rightW = doc.getTextWidth(rightText)
  }
  const maxLeftW = pageW - M * 2 - rightW - 12
  setFont(doc, leftStyle, leftSize, [20, 20, 20])
  const lines = doc.splitTextToSize(leftText || '', maxLeftW)
  // draw left lines
  doc.text(lines, M, state.y)
  // draw right text on first line baseline
  if (rightText) {
    setFont(doc, 'normal', state.sizes.sub, [100, 100, 100])
    doc.text(rightText, pageW - M, state.y, { align: 'right' })
  }
  state.y += lines.length * leftSize * state.sizes.line
}

function sectionHeaderModern(state, label) {
  const { doc, M, pageW, sizes, ar, ag, ab } = state
  ensureSpace(state, 26); state.y += 4
  setFont(doc, 'bold', sizes.h2, [ar, ag, ab])
  doc.text(label.toUpperCase(), M, state.y); state.y += 4
  doc.setDrawColor(ar, ag, ab); doc.setLineWidth(0.8)
  doc.line(M, state.y, pageW - M, state.y); state.y += 10
}

function bullet(state, text, indent = 12) {
  const { doc, M, pageW, sizes } = state
  setFont(doc, 'normal', sizes.body, [40, 40, 40])
  const maxW = pageW - M * 2 - indent
  const lines = doc.splitTextToSize(text || '', maxW)
  ensureSpace(state, sizes.body * sizes.line + 2)
  doc.text('•', M + 2, state.y)
  doc.text(lines, M + indent, state.y)
  state.y += lines.length * sizes.body * sizes.line
}

function paragraph(state, text) {
  const { doc, M, pageW, sizes } = state
  setFont(doc, 'normal', sizes.body, [40, 40, 40])
  const lines = doc.splitTextToSize(text || '', pageW - M * 2)
  ensureSpace(state, lines.length * sizes.body * sizes.line)
  doc.text(lines, M, state.y)
  state.y += lines.length * sizes.body * sizes.line
}

function headerBlock(state, pd, center = false) {
  const { doc, M, pageW, sizes } = state
  setFont(doc, 'bold', sizes.name, [20, 20, 20])
  const x = center ? pageW / 2 : M
  doc.text(pd.fullName || 'Your Name', x, state.y + sizes.name * 0.8, center ? { align: 'center' } : undefined)
  state.y += sizes.name + 6
  const parts = [pd.email, pd.phone, pd.linkedin, pd.github, pd.portfolio].filter(Boolean)
  if (parts.length) {
    setFont(doc, 'normal', sizes.sub, [90, 90, 90])
    const str = parts.join('  •  ')
    const lines = doc.splitTextToSize(str, pageW - M * 2)
    doc.text(lines, x, state.y, center ? { align: 'center' } : undefined)
    state.y += lines.length * sizes.sub * state.sizes.line
  }
}

function empBlock(state, j) {
  ensureSpace(state, 40)
  const title = `${j.jobTitle || ''}${j.company ? ' — ' + j.company : ''}`
  const dateStr = [j.startDate, j.endDate].filter(Boolean).join(' – ')
  drawTitleWithRightDate(state, title, 'bold', state.sizes.body + 1, dateStr)
  if (j.location) {
    setFont(state.doc, 'italic', state.sizes.sub, [110, 110, 110])
    state.doc.text(j.location, state.M, state.y)
    state.y += state.sizes.sub * state.sizes.line
  }
  for (const b of j.bulletPoints || []) bullet(state, b)
  state.y += 4
}

function projBlock(state, p) {
  ensureSpace(state, 30)
  drawTitleWithRightDate(state, p.name || '', 'bold', state.sizes.body + 1, p.techStack || '')
  for (const d of p.description || []) bullet(state, d)
  state.y += 4
}

function leadBlock(state, l) {
  ensureSpace(state, 30)
  const title = `${l.role || ''}${l.organization ? ' — ' + l.organization : ''}`
  const dateStr = [l.startDate, l.endDate].filter(Boolean).join(' – ')
  drawTitleWithRightDate(state, title, 'bold', state.sizes.body + 1, dateStr)
  for (const b of l.bulletPoints || []) bullet(state, b)
  state.y += 4
}

function eduBlock(state, e) {
  ensureSpace(state, 26)
  const title = `${e.degree || ''}${e.major ? ', ' + e.major : ''}`
  drawTitleWithRightDate(state, title, 'bold', state.sizes.body + 1, e.endDate || '')
  if (e.school) {
    setFont(state.doc, 'normal', state.sizes.body, [80, 80, 80])
    state.doc.text(e.school, state.M, state.y)
    state.y += state.sizes.body * state.sizes.line
  }
  if (e.relevantCoursework) {
    setFont(state.doc, 'italic', state.sizes.sub, [110, 110, 110])
    const lines = state.doc.splitTextToSize('Coursework: ' + e.relevantCoursework, state.pageW - state.M * 2)
    state.doc.text(lines, state.M, state.y)
    state.y += lines.length * state.sizes.sub * state.sizes.line
  }
  state.y += 3
}

function skillsBlock(state, skills) {
  const cats = Object.keys(skills || {})
  for (const c of cats) {
    ensureSpace(state, 14)
    const label = `${c}: `
    setFont(state.doc, 'bold', state.sizes.body, [30, 30, 30])
    const labelW = state.doc.getTextWidth(label)
    state.doc.text(label, state.M, state.y)
    setFont(state.doc, 'normal', state.sizes.body, [60, 60, 60])
    const val = (skills[c] || []).join(', ')
    const lines = state.doc.splitTextToSize(val, state.pageW - state.M * 2 - labelW)
    state.doc.text(lines[0] || '', state.M + labelW, state.y)
    for (let i = 1; i < lines.length; i++) {
      state.y += state.sizes.body * state.sizes.line
      ensureSpace(state, 14)
      state.doc.text(lines[i], state.M, state.y)
    }
    state.y += state.sizes.body * state.sizes.line + 2
  }
}

function softSkillsBlock(state, list) {
  if (!list?.length) return
  setFont(state.doc, 'normal', state.sizes.body, [60, 60, 60])
  const lines = state.doc.splitTextToSize(list.join(' • '), state.pageW - state.M * 2)
  ensureSpace(state, lines.length * state.sizes.body * state.sizes.line)
  state.doc.text(lines, state.M, state.y)
  state.y += lines.length * state.sizes.body * state.sizes.line + 2
}

function certBlock(state, c) {
  ensureSpace(state, 14)
  setFont(state.doc, 'normal', state.sizes.body, [40, 40, 40])
  const dateStr = c.date || ''
  let rightW = 0
  if (dateStr) { setFont(state.doc, 'normal', state.sizes.sub, [110, 110, 110]); rightW = state.doc.getTextWidth(dateStr) }
  setFont(state.doc, 'normal', state.sizes.body, [40, 40, 40])
  const lines = state.doc.splitTextToSize('• ' + (c.name || ''), state.pageW - state.M * 2 - rightW - 8)
  state.doc.text(lines, state.M + 2, state.y)
  if (dateStr) { setFont(state.doc, 'normal', state.sizes.sub, [110, 110, 110]); state.doc.text(dateStr, state.pageW - state.M, state.y, { align: 'right' }) }
  state.y += lines.length * state.sizes.body * state.sizes.line
}

function renderModern({ doc, resume, sizes, ar, ag, ab, pageW, pageH, M, sectionOrder, filename }) {
  const state = { doc, sizes, ar, ag, ab, pageW, pageH, M, y: M }
  headerBlock(state, resume.personalDetails || {}, false)
  const order = sectionOrder && sectionOrder.length ? sectionOrder : ['summary','employment','projects','leadership','education','skills','softSkills','certifications','custom']
  for (const sec of order) {
    if (sec === 'summary' && resume.professionalSummary) { sectionHeaderModern(state, 'Professional Summary'); paragraph(state, resume.professionalSummary) }
    else if (sec === 'employment' && (resume.employmentHistory || []).length) { sectionHeaderModern(state, 'Experience'); for (const j of resume.employmentHistory) empBlock(state, j) }
    else if (sec === 'projects' && (resume.projects || []).length) { sectionHeaderModern(state, 'Projects'); for (const p of resume.projects) projBlock(state, p) }
    else if (sec === 'leadership' && (resume.leadershipVolunteering || []).length) { sectionHeaderModern(state, 'Leadership & Volunteering'); for (const l of resume.leadershipVolunteering) leadBlock(state, l) }
    else if (sec === 'education' && (resume.education || []).length) { sectionHeaderModern(state, 'Education'); for (const e of resume.education) eduBlock(state, e) }
    else if (sec === 'skills' && Object.keys(resume.skills || {}).length) { sectionHeaderModern(state, 'Skills'); skillsBlock(state, resume.skills) }
    else if (sec === 'softSkills' && (resume.softSkills || []).length) { sectionHeaderModern(state, 'Soft Skills & Competencies'); softSkillsBlock(state, resume.softSkills) }
    else if (sec === 'certifications' && (resume.certifications || []).length) { sectionHeaderModern(state, 'Certifications'); for (const c of resume.certifications) certBlock(state, c) }
    else if (sec === 'custom' && (resume.customSections || []).length) {
      for (const cs of resume.customSections) {
        const entries = cs.entries || []
        if (!cs.title && entries.length === 0) continue
        sectionHeaderModern(state, cs.title || 'Additional')
        for (const e of entries) {
          ensureSpace(state, 30)
          if (e.heading || e.subheading) {
            const title = `${e.heading || ''}${e.subheading ? ' \u2014 ' + e.subheading : ''}`
            const dateStr = [e.startDate, e.endDate].filter(Boolean).join(' \u2013 ')
            drawTitleWithRightDate(state, title, 'bold', state.sizes.body + 1, dateStr)
          }
          if (e.location) {
            setFont(state.doc, 'italic', state.sizes.sub, [110, 110, 110])
            state.doc.text(e.location, state.M, state.y)
            state.y += state.sizes.sub * state.sizes.line
          }
          for (const b of e.bulletPoints || []) bullet(state, b)
          state.y += 4
        }
      }
    }
  }
  doc.save(filename)
}

// ---------- Executive Classic: two-column layout ----------
function renderExecutive({ doc, resume, sizes, ar, ag, ab, pageW, pageH, M, sectionOrder, filename }) {
  // header centered with accent rule
  let y = M
  const pd = resume.personalDetails || {}
  doc.setFont('helvetica', 'bold'); doc.setFontSize(sizes.name); doc.setTextColor(20, 20, 20)
  doc.text(pd.fullName || 'Your Name', pageW / 2, y + sizes.name * 0.8, { align: 'center' })
  y += sizes.name + 6
  const parts = [pd.email, pd.phone, pd.linkedin, pd.github, pd.portfolio].filter(Boolean)
  if (parts.length) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(sizes.sub); doc.setTextColor(80, 80, 80)
    const lines = doc.splitTextToSize(parts.join('  •  '), pageW - M * 2)
    doc.text(lines, pageW / 2, y, { align: 'center' })
    y += lines.length * sizes.sub * sizes.line
  }
  doc.setDrawColor(ar, ag, ab); doc.setLineWidth(1.2); doc.line(M, y + 2, pageW - M, y + 2); y += 10
  const colTop = y

  const sidebarW = 175
  const gutter = 16
  const sidebarX = M
  const mainX = M + sidebarW + gutter
  const mainW = pageW - mainX - M

  const drawSidebarHeader = (label, yy) => {
    doc.setFillColor(ar, ag, ab); doc.rect(sidebarX, yy, sidebarW, sizes.h2 + 5, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(sizes.h2); doc.setTextColor(255, 255, 255)
    doc.text(label.toUpperCase(), sidebarX + 6, yy + sizes.h2 + 1)
    return yy + sizes.h2 + 10
  }
  const drawMainHeader = (label, yy) => {
    doc.setFillColor(ar, ag, ab); doc.rect(mainX, yy, mainW, sizes.h2 + 5, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(sizes.h2); doc.setTextColor(255, 255, 255)
    doc.text(label.toUpperCase(), mainX + 6, yy + sizes.h2 + 1)
    return yy + sizes.h2 + 10
  }

  // Render sidebar content
  let sy = colTop
  const sidebarParagraph = (text, sizeKey = 'body', color = [60, 60, 60]) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(sizes[sizeKey]); doc.setTextColor(color[0], color[1], color[2])
    const lines = doc.splitTextToSize(text, sidebarW)
    doc.text(lines, sidebarX, sy)
    sy += lines.length * sizes[sizeKey] * sizes.line
  }
  const sidebarLabel = (text) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(sizes.body); doc.setTextColor(20, 20, 20); doc.text(text, sidebarX, sy); sy += sizes.body * sizes.line }

  const skillCats = Object.keys(resume.skills || {})
  if (skillCats.length) {
    sy = drawSidebarHeader('Skills', sy)
    for (const c of skillCats) {
      sidebarLabel(c)
      sidebarParagraph((resume.skills[c] || []).join(', '))
      sy += 2
    }
    sy += 4
  }
  if ((resume.softSkills || []).length) {
    sy = drawSidebarHeader('Soft Skills', sy)
    sidebarParagraph(resume.softSkills.join(' • '))
    sy += 4
  }
  if ((resume.education || []).length) {
    sy = drawSidebarHeader('Education', sy)
    for (const e of resume.education) {
      sidebarLabel(`${e.degree || ''}${e.major ? ', ' + e.major : ''}`)
      sidebarParagraph(e.school || '')
      if (e.endDate) sidebarParagraph(e.endDate, 'sub', [110, 110, 110])
      if (e.relevantCoursework) sidebarParagraph(e.relevantCoursework, 'sub', [120, 120, 120])
      sy += 3
    }
    sy += 4
  }
  if ((resume.certifications || []).length) {
    sy = drawSidebarHeader('Certifications', sy)
    for (const c of resume.certifications) {
      sidebarParagraph(`• ${c.name || ''}${c.date ? ' (' + c.date + ')' : ''}`)
    }
  }

  // Render main content
  const mainState = { doc, sizes, ar, ag, ab, pageW: mainX + mainW, pageH, M: mainX, y: colTop }
  const mainEnsure = (need) => { if (mainState.y + need > pageH - M) { doc.addPage(); mainState.y = M; sy = M } }
  const mainParagraph = (text, color = [50, 50, 50]) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(sizes.body); doc.setTextColor(color[0], color[1], color[2])
    const lines = doc.splitTextToSize(text, mainW)
    mainEnsure(lines.length * sizes.body * sizes.line)
    doc.text(lines, mainX, mainState.y)
    mainState.y += lines.length * sizes.body * sizes.line
  }
  const mainTitleWithDate = (left, right) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(sizes.sub)
    const rightW = right ? doc.getTextWidth(right) : 0
    const maxLeft = mainW - rightW - 8
    doc.setFont('helvetica', 'bold'); doc.setFontSize(sizes.body + 1); doc.setTextColor(20, 20, 20)
    const lines = doc.splitTextToSize(left, maxLeft)
    mainEnsure(lines.length * (sizes.body + 1) * sizes.line)
    doc.text(lines, mainX, mainState.y)
    if (right) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(sizes.sub); doc.setTextColor(110, 110, 110)
      doc.text(right, mainX + mainW, mainState.y, { align: 'right' })
    }
    mainState.y += lines.length * (sizes.body + 1) * sizes.line
  }
  const mainBullet = (text) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(sizes.body); doc.setTextColor(45, 45, 45)
    const lines = doc.splitTextToSize(text, mainW - 12)
    mainEnsure(lines.length * sizes.body * sizes.line + 2)
    doc.text('•', mainX + 2, mainState.y)
    doc.text(lines, mainX + 12, mainState.y)
    mainState.y += lines.length * sizes.body * sizes.line
  }

  if (resume.professionalSummary) {
    mainState.y = drawMainHeader('Profile', mainState.y)
    mainParagraph(resume.professionalSummary)
    mainState.y += 4
  }
  if ((resume.employmentHistory || []).length) {
    mainState.y = drawMainHeader('Experience', mainState.y)
    for (const j of resume.employmentHistory) {
      mainTitleWithDate(`${j.jobTitle || ''}${j.company ? ' — ' + j.company : ''}`, [j.startDate, j.endDate].filter(Boolean).join(' – '))
      if (j.location) {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(sizes.sub); doc.setTextColor(110, 110, 110)
        doc.text(j.location, mainX, mainState.y); mainState.y += sizes.sub * sizes.line
      }
      for (const b of j.bulletPoints || []) mainBullet(b)
      mainState.y += 4
    }
  }
  if ((resume.projects || []).length) {
    mainState.y = drawMainHeader('Projects', mainState.y)
    for (const p of resume.projects) {
      mainTitleWithDate(p.name || '', p.techStack || '')
      for (const d of p.description || []) mainBullet(d)
      mainState.y += 4
    }
  }
  if ((resume.leadershipVolunteering || []).length) {
    mainState.y = drawMainHeader('Leadership & Volunteering', mainState.y)
    for (const l of resume.leadershipVolunteering) {
      mainTitleWithDate(`${l.role || ''}${l.organization ? ' — ' + l.organization : ''}`, [l.startDate, l.endDate].filter(Boolean).join(' – '))
      for (const b of l.bulletPoints || []) mainBullet(b)
      mainState.y += 4
    }
  }
  for (const cs of resume.customSections || []) {
    const entries = cs.entries || []
    if (!cs.title && entries.length === 0) continue
    mainState.y = drawMainHeader(cs.title || 'Additional', mainState.y)
    for (const e of entries) {
      if (e.heading || e.subheading) {
        mainTitleWithDate(`${e.heading || ''}${e.subheading ? ' \u2014 ' + e.subheading : ''}`, [e.startDate, e.endDate].filter(Boolean).join(' \u2013 '))
      }
      if (e.location) {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(sizes.sub); doc.setTextColor(110, 110, 110)
        doc.text(e.location, mainX, mainState.y); mainState.y += sizes.sub * sizes.line
      }
      for (const b of e.bulletPoints || []) mainBullet(b)
      mainState.y += 4
    }
  }

  doc.save(filename)
}
