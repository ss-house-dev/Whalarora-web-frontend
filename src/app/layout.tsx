import { Anuphan } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'


const anuphan = Anuphan({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Whalalora',
  description: 'Homepage of Whalalora',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={anuphan.className}>
      <body>
          {children}
      </body>
    </html>
  )
}
