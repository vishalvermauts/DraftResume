import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'DraftResume',
  description: 'BYOK AI-powered DraftResume with ATS-friendly PDF export',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-slate-50">
        <Providers>{children}</Providers>
        <div id="print-portal"></div>
      </body>
    </html>
  )
}
