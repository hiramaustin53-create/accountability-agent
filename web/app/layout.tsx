import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accountability Agent',
  description: 'AI-powered meeting intelligence & accountability tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        margin: 0, 
        padding: '20px', 
        background: '#f5f5f5', 
        color: '#333',
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  )
}
