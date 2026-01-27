import './globals.css'
import skIcon from '../sk_icon.png'

export const metadata = {
  title: 'SK Bordados - Gerenciamento de Pedidos',
  description: 'Sistema de gerenciamento de pedidos de bordados',
  icons: {
    icon: skIcon.src,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
