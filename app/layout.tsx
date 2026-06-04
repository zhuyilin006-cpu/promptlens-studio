import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PromptLens Studio ® - Advanced AI Application Hub',
  description: 'Deconstructing Realism into Fine-grained Generative Prompt Protocols.',
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
        {children}
      </body>
    </html>
  );
}