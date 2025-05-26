import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '吵架包赢',
  description: '帮你在任何争论中都能包赢的AI工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <div className="max-w-md mx-auto min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 