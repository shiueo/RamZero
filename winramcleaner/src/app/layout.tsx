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
        {children}
      </body>
    </html>
  )
}
