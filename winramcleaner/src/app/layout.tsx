import { Toaster } from 'react-hot-toast'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="font-pretendard" suppressHydrationWarning>
      <body>
        <div className="fixed inset-0 -z-10"></div>
        <Toaster
          toastOptions={{
            className: 'font-semibold',
            style: {
              borderRadius: '30px',
              background: '#ffffff',
              color: '#000000',
            },
          }}
          position="bottom-right"
          reverseOrder={false}
        />
        {children}
      </body>
    </html>
  )
}
