import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Registro de Checklist de Viatura',
  description: 'Sistema de registro de checklist de viatura de final de turno',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
