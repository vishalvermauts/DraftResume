'use client'

let pdfjsLib = null

async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import('pdfjs-dist/build/pdf.mjs')
  mod.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${mod.version}/build/pdf.worker.min.mjs`
  pdfjsLib = mod
  return mod
}

export async function extractTextFromPDF(file) {
  const pdfjs = await getPdfJs()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((it) => it.str).join(' ')
    fullText += pageText + '\n\n'
  }
  return fullText.trim()
}

export async function extractTextFromDOCX(file) {
  const mammoth = (await import('mammoth/mammoth.browser')).default || (await import('mammoth/mammoth.browser'))
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return (result.value || '').trim()
}

export async function extractTextFromFile(file) {
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.pdf')) return extractTextFromPDF(file)
  if (name.endsWith('.docx')) return extractTextFromDOCX(file)
  if (name.endsWith('.txt')) return file.text()
  throw new Error('Unsupported file. Please upload a .pdf, .docx, or .txt file.')
}
