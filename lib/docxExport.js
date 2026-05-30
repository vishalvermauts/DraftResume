'use client'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

function hexToRgb(hex) {
  const h = (hex || '#4f46e5').replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return v.toUpperCase()
}

const run = (text, opts = {}) => new TextRun({ text: String(text || ''), bold: !!opts.bold, italics: !!opts.italic, color: opts.color, size: opts.size, font: opts.font || 'Calibri' })

function headerLine(label, accentHex) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: { bottom: { color: accentHex, space: 2, style: BorderStyle.SINGLE, size: 8 } },
    children: [run(label.toUpperCase(), { bold: true, size: 24, color: accentHex })],
  })
}

function titleDateRow(left, right) {
  return new Paragraph({
    tabStops: [{ type: 'right', position: 9000 }],
    children: [run(left, { bold: true, size: 22 }), new TextRun({ text: '\t' + (right || ''), size: 20, color: '666666' })],
  })
}

function sub(text) { return new Paragraph({ children: [run(text, { italic: true, size: 20, color: '777777' })] }) }
function bodyP(text) { return new Paragraph({ spacing: { after: 80 }, children: [run(text, { size: 22 })] }) }
function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [run(text, { size: 22 })],
  })
}

export async function exportResumeDOCX({ resume, accentColor, fontSize, sectionOrder, filename = 'resume.docx' }) {
  const accent = hexToRgb(accentColor)
  const pd = resume.personalDetails || {}
  const children = []

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [run(pd.fullName || 'Your Name', { bold: true, size: 40 })],
  }))
  const contactParts = [pd.email, pd.phone, pd.linkedin, pd.github, pd.portfolio].filter(Boolean)
  if (contactParts.length) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [run(contactParts.join('  •  '), { size: 20, color: '666666' })],
    }))
  }

  const order = sectionOrder?.length ? sectionOrder : ['summary','employment','projects','leadership','education','skills','softSkills','certifications','custom']
  for (const sec of order) {
    if (sec === 'summary' && resume.professionalSummary) {
      children.push(headerLine('Professional Summary', accent))
      children.push(bodyP(resume.professionalSummary))
    } else if (sec === 'employment' && (resume.employmentHistory || []).length) {
      children.push(headerLine('Experience', accent))
      for (const j of resume.employmentHistory) {
        children.push(titleDateRow(`${j.jobTitle || ''}${j.company ? ' — ' + j.company : ''}`, [j.startDate, j.endDate].filter(Boolean).join(' – ')))
        if (j.location) children.push(sub(j.location))
        for (const b of j.bulletPoints || []) children.push(bullet(b))
      }
    } else if (sec === 'projects' && (resume.projects || []).length) {
      children.push(headerLine('Projects', accent))
      for (const p of resume.projects) {
        children.push(titleDateRow(p.name || '', p.techStack || ''))
        for (const d of p.description || []) children.push(bullet(d))
      }
    } else if (sec === 'leadership' && (resume.leadershipVolunteering || []).length) {
      children.push(headerLine('Leadership & Volunteering', accent))
      for (const l of resume.leadershipVolunteering) {
        children.push(titleDateRow(`${l.role || ''}${l.organization ? ' — ' + l.organization : ''}`, [l.startDate, l.endDate].filter(Boolean).join(' – ')))
        for (const b of l.bulletPoints || []) children.push(bullet(b))
      }
    } else if (sec === 'education' && (resume.education || []).length) {
      children.push(headerLine('Education', accent))
      for (const e of resume.education) {
        children.push(titleDateRow(`${e.degree || ''}${e.major ? ', ' + e.major : ''}`, e.endDate || ''))
        if (e.school) children.push(bodyP(e.school))
        if (e.relevantCoursework) children.push(sub('Coursework: ' + e.relevantCoursework))
      }
    } else if (sec === 'skills' && Object.keys(resume.skills || {}).length) {
      children.push(headerLine('Skills', accent))
      for (const c of Object.keys(resume.skills)) {
        children.push(new Paragraph({ spacing: { after: 40 }, children: [run(c + ': ', { bold: true, size: 22 }), run((resume.skills[c] || []).join(', '), { size: 22 })] }))
      }
    } else if (sec === 'softSkills' && (resume.softSkills || []).length) {
      children.push(headerLine('Soft Skills & Competencies', accent))
      children.push(bodyP(resume.softSkills.join(' • ')))
    } else if (sec === 'certifications' && (resume.certifications || []).length) {
      children.push(headerLine('Certifications', accent))
      for (const c of resume.certifications) children.push(bullet(`${c.name || ''}${c.date ? ' (' + c.date + ')' : ''}`))
    } else if (sec === 'custom' && (resume.customSections || []).length) {
      for (const cs of resume.customSections) {
        const entries = cs.entries || []
        if (!cs.title && entries.length === 0) continue
        children.push(headerLine(cs.title || 'Additional', accent))
        for (const e of entries) {
          if (e.heading || e.subheading) children.push(titleDateRow(`${e.heading || ''}${e.subheading ? ' \u2014 ' + e.subheading : ''}`, [e.startDate, e.endDate].filter(Boolean).join(' \u2013 ')))
          if (e.location) children.push(sub(e.location))
          for (const b of e.bulletPoints || []) children.push(bullet(b))
        }
      }
    }
  }

  const doc = new Document({
    creator: 'DraftResume',
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }],
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}

export async function exportCoverLetterDOCX({ text, name, contact, filename = 'cover-letter.docx' }) {
  const lines = (text || '').split(/\n+/).filter(Boolean)
  const children = []
  if (name) children.push(new Paragraph({ children: [run(name, { bold: true, size: 28 })] }))
  if (contact) children.push(new Paragraph({ spacing: { after: 200 }, children: [run(contact, { size: 20, color: '666666' })] }))
  for (const l of lines) children.push(new Paragraph({ spacing: { after: 160 }, children: [run(l, { size: 22 })] }))
  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } }, children }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
