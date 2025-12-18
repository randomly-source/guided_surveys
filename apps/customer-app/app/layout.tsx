import './globals.css'

export const metadata = {
  title: 'Customer Survey - Live Survey',
  description: 'Customer survey interface for live agent-led surveys',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // #region debug log
  if (typeof window !== 'undefined') {
    const checkCSSLoaded = () => {
      const stylesheets = Array.from(document.styleSheets);
      const hasTailwind = stylesheets.some(sheet => {
        try {
          return sheet.href?.includes('_next/static') || Array.from(sheet.cssRules || []).some(rule => 
            rule.cssText?.includes('tailwind') || rule.cssText?.includes('text-5xl') || rule.cssText?.includes('text-4xl')
          );
        } catch { return false; }
      });
      fetch('http://127.0.0.1:7242/ingest/20201c68-e8ed-4862-870b-3581860b6715',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:18',message:'CSS Loading Check',data:{stylesheetCount:stylesheets.length,hasTailwindStyles:hasTailwind,globalsCSSImported:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    };
    if (document.readyState === 'complete') checkCSSLoaded();
    else window.addEventListener('load', checkCSSLoaded);
  }
  // #endregion

  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
