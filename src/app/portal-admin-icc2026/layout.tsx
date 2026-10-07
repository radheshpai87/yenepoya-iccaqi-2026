import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administrator Access Portal | ICCAQI 2026',
  description: 'Authorized administrative management portal for ICCAQI 2026 conference records.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
