'use client'
// Template configuration system. Each template is a JSON config consumed by both
// the HTML preview renderer and the (separate) PDF/Word path. The HTML preview is
// the source of truth - the "Print to PDF" button uses the browser's print engine
// to convert that exact HTML into an ATS-friendly PDF with native text.

import { sansStack, serifStack } from '@/lib/typography'

export const TEMPLATES = {
  modern:    { name: 'Modern Minimalist',   layout: 'single',       font: 'sans',  headerStyle: 'underline',       nameAlign: 'left',   density: 'normal',  dateStyle: 'inline',  techStack: 'below' },
  executive: { name: 'Executive Classic',   layout: 'sidebar-left', font: 'serif', headerStyle: 'filled-bar',      nameAlign: 'center', density: 'normal',  dateStyle: 'inline',  techStack: 'below' },
  compact:   { name: 'Compact Pro',         layout: 'single',       font: 'sans',  headerStyle: 'thin-underline',  nameAlign: 'left',   density: 'compact', dateStyle: 'inline',  techStack: 'below' },
  corporate: { name: 'Corporate Bold',      layout: 'header-band',  font: 'sans',  headerStyle: 'filled-bar',      nameAlign: 'left',   density: 'normal',  dateStyle: 'inline',  techStack: 'below' },
  classic:   { name: 'Classic Serif',       layout: 'single',       font: 'serif', headerStyle: 'thick-underline', nameAlign: 'center', density: 'normal',  dateStyle: 'inline',  techStack: 'below' },
  sidebarR:  { name: 'Sidebar Right',       layout: 'sidebar-right',font: 'sans',  headerStyle: 'filled-bar',      nameAlign: 'left',   density: 'normal',  dateStyle: 'inline',  techStack: 'below' },
  tech:      { name: 'Tech Engineer',       layout: 'single',       font: 'sans',  headerStyle: 'left-bar',        nameAlign: 'left',   density: 'normal',  dateStyle: 'inline',  techStack: 'below' },
  academic:  { name: 'Academic CV',         layout: 'single',       font: 'serif', headerStyle: 'thick-underline', nameAlign: 'center', density: 'normal',  dateStyle: 'below',   techStack: 'below' },
  hybrid:    { name: 'Mid-Career Hybrid',   layout: 'single',       font: 'sans',  headerStyle: 'left-bar',        nameAlign: 'left',   density: 'normal',  dateStyle: 'inline',  techStack: 'below' },
  centered:  { name: 'Minimal Centered',    layout: 'single',       font: 'sans',  headerStyle: 'underline',       nameAlign: 'center', density: 'normal',  dateStyle: 'inline',  techStack: 'below' },
}

export function templateFontFamily(font) {
  return font === 'serif' ? serifStack : sansStack
}
