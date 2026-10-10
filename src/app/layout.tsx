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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yenepoya.edu.in/iccaqi-2026';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'ICCAQI 2026 | International Conference on Computing, AI, Quantum Intelligence and Future Technologies',
  description: 'Official portal of ICCAQI 2026 at Yenepoya University, Mangaluru, India. Nov 6–7, 2026 (Hybrid). Scopus & Peer-Reviewed publication tracks. Submit papers now.',
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
    description: 'Join global researchers at ICCAQI 2026 organized by Yenepoya School of Engineering & Technology, Yenepoya (Deemed to be University), Mangaluru, India. Hybrid Mode (In-Person & Online) • November 25–26, 2026 • Scopus & Peer-Reviewed Publication Tracks.',
    url: siteUrl,
    siteName: 'ICCAQI 2026',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ICCAQI 2026 | International Conference on Computing, AI & Quantum Intelligence',
    description: 'November 25–26, 2026 • Yenepoya (Deemed to be University), Mangaluru, India. Hybrid Mode (In-Person & Online) • Scopus Publication Tracks.',
  },
  verification: {
    google: '2woGajKPbMH025rhKAz9DV9mVQQhPIfhNs8uQVazris',
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
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
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
      url: siteUrl,
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
    '@type': 'AggregateOffer',
    url: `${siteUrl}#registration`,
    priceCurrency: 'INR',
    lowPrice: '500',
    highPrice: '1500',
    offerCount: 3,
    offers: [
      {
        '@type': 'Offer',
        name: 'Students (UG / PG) Delegate',
        price: '500',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-03-01',
        url: `${siteUrl}#registration`,
      },
      {
        '@type': 'Offer',
        name: 'Research Scholars / Academicians Delegate',
        price: '750',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-03-01',
        url: `${siteUrl}#registration`,
      },
      {
        '@type': 'Offer',
        name: 'Industry Delegate',
        price: '1500',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-03-01',
        url: `${siteUrl}#registration`,
      },
    ],
  },
  about: [
    'Artificial Intelligence and Machine Learning',
    'Quantum Computing and Quantum Intelligence',
    'Data Science, Big Data and Analytics',
    'Emerging Computing Technologies',
    'Cyber-Physical Systems and IoT',
    'Smart Systems and Intelligent Applications',
    'AI for Healthcare and Biomedical Applications',
    'Ethics, Society and Future Technologies',
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
