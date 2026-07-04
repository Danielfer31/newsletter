import type { Metadata } from 'next'
import { Archivo, Spectral } from 'next/font/google'
import './globals.css'

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
})

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
})

export const metadata: Metadata = {
  title: 'La Biblioteca de Apolo',
  description: 'Política, geopolítica, anime, fútbol, música y todo lo demás.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${spectral.variable} ${archivo.variable}`}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
