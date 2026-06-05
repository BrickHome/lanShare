import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "局域网文件共享平台",
  description: "快速安全的局域网文件共享，支持扫码下载",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {children}
      </body>
    </html>
  );
}
