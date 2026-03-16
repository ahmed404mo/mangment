import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const cairo = Cairo({ subsets: ["arabic"] })

export const metadata: Metadata = {
  // العنوان اللي هيظهر في الـ Tab فوق
  title: "كلية التربية للطفولة المبكرة | جامعة القاهرة",
  // الوصف اللي بيظهر تحت العنوان في محركات البحث
  description: "منصة رسائل  التربية للطفولة المبكرة - جامعة القاهرة.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.className} min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {/* هنا بيعرض أي صفحة (سواء دخول أو الموقع الرئيسي) */}
            {children}
        </ThemeProvider>
      </body>
    </html>
  )
}