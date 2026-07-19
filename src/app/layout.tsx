import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { isAdmin } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "電競娃娃虛擬收藏室 | Esports Doll Showcase",
  description: "開源、免費自架的電競娃娃虛擬收藏室 — AI 去背、場景拼圖、多造型展示",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 靜態輸出：純展示站，沒有後台入口（也不能呼叫 cookies()）
  // 本機 dev：即個人 CMS，直接顯示管理後台
  const isStaticExport = process.env.STATIC_EXPORT === "1";
  const admin = isStaticExport
    ? false
    : process.env.NODE_ENV === "development"
      ? true
      : await isAdmin();
  return (
    <html lang="zh-Hant" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
          <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="text-xl">🧸</span>
              <span>Doll Showcase</span>
            </Link>
            <div className="flex flex-1 items-center gap-4 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                收藏總覽
              </Link>
              <Link href="/scenes" className="hover:text-foreground">
                虛擬收藏室
              </Link>
            </div>
            {admin ? (
              <Link
                href="/admin"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                管理後台
              </Link>
            ) : isStaticExport ? null : (
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                管理員登入
              </Link>
            )}
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}
