import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yenepoya.edu.in'),
  title: 'ICCAQI 2026 | International Conference on Computing, AI, Quantum Intelligence and Future Technologies',
  description: 'Official portal of ICCAQI 2026 organized by Yenepoya School of Engineering & Technology, Yenepoya (Deemed to be University), Mangaluru, Karnataka, India. November 6–7, 2026 (Hybrid Mode).',
  keywords: [
    'ICCAQI 2026',
    'Yenepoya University',
    'School of Engineering & Technology',
    'International Conference',
    'Computing Conference',
    'Artificial Intelligence',
    'Quantum Intelligence',
    'Future Technologies',
    'Mangaluru Conference',
    'Scopus Indexed',
    'Call for Papers'
  ],
  authors: [{ name: 'Yenepoya School of Engineering & Technology' }],
  openGraph: {
    title: 'ICCAQI 2026 | International Conference on Computing, AI & Quantum Intelligence',
    description: 'November 6–7, 2026 • Yenepoya (Deemed to be University), Mangaluru, India. Hybrid Mode.',
    url: 'https://yenepoya.edu.in/iccaqi-2026',
    siteName: 'ICCAQI 2026',
    images: [
      {
        url: '/iccaqi-2026-poster.png',
        width: 1024,
        height: 1536,
        alt: 'ICCAQI 2026 Official Conference Poster',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
