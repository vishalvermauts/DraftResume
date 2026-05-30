'use client'
// Shared font/size helpers so HTML preview and jsPDF output match visually.
// A4 = 595 x 842 pt = 794 x 1123 px (at 96 dpi). Using pt units in CSS preserves identical sizing in both.

export function getTypography(fontSize) {
  const body = Number(fontSize) || 11
  return {
    bodyPt: body,
    subPt: Math.max(8, body - 1),
    h2Pt: body,
    namePt: body + 9, // 11 -> 20pt name
    line: 1.32,
    marginPt: 40,
  }
}

export const sansStack = 'Helvetica, Arial, sans-serif'
export const serifStack = '"Times New Roman", Times, serif'
