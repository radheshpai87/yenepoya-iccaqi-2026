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
  openGraph: {
    title: 'ICCAQI 2026 | International Conference on Computing, AI, Quantum Intelligence and Future Technologies',
    description: 'Join global researchers at ICCAQI 2026 organized by Yenepoya School of Engineering & Technology, Yenepoya (Deemed to be University), Mangaluru, India. Hybrid Mode (In-Person & Online) • November 6–7, 2026 • Scopus & Peer-Reviewed Publication Tracks.',
    url: 'https://yenepoya.edu.in/iccaqi-2026',
    siteName: 'ICCAQI 2026',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://yenepoya.edu.in/iccaqi-2026',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ICCAQI 2026 | International Conference on Computing, AI & Quantum Intelligence',
    description: 'November 6–7, 2026 • Yenepoya (Deemed to be University), Mangaluru, India. Hybrid Mode (In-Person & Online) • Scopus Publication Tracks.',
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

const jsonLdConference = {
  '@context': 'https://schema.org',
  '@type': 'EducationEvent',
  name: 'ICCAQI 2026 - International Conference on Computing, AI, Quantum Intelligence and Future Technologies',
  alternateName: 'ICCAQI 2026',
  description: 'International Conference on Computing, AI, Quantum Intelligence and Future Technologies organized by Yenepoya School of Engineering & Technology, Yenepoya (Deemed to be University), Mangaluru, India.',
  startDate: '2026-11-06T09:00:00+05:30',
  endDate: '2026-11-07T18:00:00+05:30',
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  url: 'https://yenepoya.edu.in/iccaqi-2026',
  image: 'https://yenepoya.edu.in/iccaqi-2026-poster.png',
  location: [
    {
      '@type': 'Place',
      name: 'Yenepoya School of Engineering & Technology',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'University Road, Deralakatte',
        addressLocality: 'Mangaluru',
        addressRegion: 'Karnataka',
        postalCode: '575018',
        addressCountry: 'IN',
      },
    },
    {
      '@type': 'VirtualLocation',
      url: 'https://yenepoya.edu.in/iccaqi-2026',
    },
  ],
  organizer: {
    '@type': 'CollegeOrUniversity',
    name: 'Yenepoya (Deemed to be University)',
    url: 'https://yenepoya.edu.in',
    department: {
      '@type': 'EducationalOrganization',
      name: 'Yenepoya School of Engineering & Technology',
    },
  },
  offers: {
    '@type': 'Offer',
    url: 'https://yenepoya.edu.in/iccaqi-2026#registration',
    price: '1500',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    validFrom: '2026-03-01',
  },
  about: [
    'Artificial Intelligence and Machine Learning',
    'Quantum Computing and Quantum Intelligence',
    'Cyber-Physical Systems and IoT',
    'Next-Generation Computing Architectures',
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdConference) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
