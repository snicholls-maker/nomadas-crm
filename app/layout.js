import './globals.css'

export const metadata = {
  title: 'Nómadas CRM',
  description: 'CRM de leads WhatsApp para Nómadas Design',
  manifest: '/manifest.json',
  themeColor: '#8B5E3C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nómadas CRM',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nómadas CRM" />
        <meta name="theme-color" content="#8B5E3C" />
      </head>
      <body className="min-h-screen bg-nomadas-cream">
        {children}
      </body>
    </html>
  )
}
