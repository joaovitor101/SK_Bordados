import './globals.css'

export const metadata = {
  title: 'SK Bordados - Gerenciamento de Pedidos',
  description: 'Sistema de gerenciamento de pedidos de bordados',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
