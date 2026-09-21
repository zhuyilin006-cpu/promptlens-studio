import './globals.css';
import type { Metadata, Viewport } from 'next';
import RegisterSW from '@/components/pwa/RegisterSW';

export const metadata: Metadata = {
  title: 'PromptLens Studio ® - AI 影像分镜工作台',
  description: '面向 AI 影像创作的分镜、提示词与节点工作流控制台。',
  manifest: '/manifest.webmanifest',
  applicationName: '情感聊天搭子',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '情感聊天搭子',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f4718c',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className="scroll-smooth">
      <head>
        {/* 异步导入高定画册感字体 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-[#FBFBFA] overflow-x-hidden">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
