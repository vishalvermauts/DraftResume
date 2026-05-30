'use client'
import jsPDF from 'jspdf'

export function exportCoverLetterPDF({ text, name, contact, filename = 'cover-letter.pdf' }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const M = 60
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  let y = M
  if (name) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(20, 20, 20)
    doc.text(name, M, y); y += 22
  }
  if (contact) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(110, 110, 110)
    doc.text(contact, M, y); y += 24
  }
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(40, 40, 40)
  const paras = (text || '').split(/\n+/).filter(Boolean)
  for (const p of paras) {
    const lines = doc.splitTextToSize(p, pageW - M * 2)
    for (const line of lines) {
      if (y > pageH - M) { doc.addPage(); y = M }
      doc.text(line, M, y); y += 14
    }
    y += 8
  }
  doc.save(filename)
}
