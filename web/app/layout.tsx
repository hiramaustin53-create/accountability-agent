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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: '20px', background: '#f5f5f5', color: '#333' }}>
        {children}
      </body>
    </html>
  )
}
