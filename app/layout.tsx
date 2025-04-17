import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'taskverse',
  description: 'Created by vbs',
  generator: 'vbs-0(github)',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
