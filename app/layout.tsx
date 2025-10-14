// app/layout.tsx
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import LoadingBar from '@/components/loading-bar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'NSTIF',
  description: 'Connect volunteers with opportunities and manage agencies and projects.',
  generator: 'Next.js',
  applicationName: 'NSTIF',
  keywords: ['volunteer', 'community', 'non-profit', 'agency management', 'project management', 'volunteer opportunities'],
  authors: [{ name: 'DiasporaBase Team', url: 'https://diasporabase.com' }],
  creator: 'DiasporaBase Team',
  publisher: 'DiasporaBase',
  openGraph: {
    title: 'NSTIF',
    description: 'Connect volunteers with opportunities and manage agencies and projects.',
    url: 'https://diasporabase.com',
    siteName: 'NSTIF',
    images: [
      {
        url: 'https://diasporabase.com/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'DiasporaBase Open Graph Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NSTIF',
    description: 'Connect volunteers with opportunities and manage agencies and projects.',
    images: ['https://diasporabase.com/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <LoadingBar />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}