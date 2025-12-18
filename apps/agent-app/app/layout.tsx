import './globals.css'

export const metadata = {
  title: 'Agent Console - Live Survey',
  description: 'Agent console for managing live survey sessions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
