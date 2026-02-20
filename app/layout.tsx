// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import LoadingBar from "@/components/loading-bar";
import TanstackProvider from "@/providers/tanstackProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NSITF",
  description:
    "Secure access to Automated and Digital Actuarial Data Structure",
  generator: "Next.js",
  applicationName: "NSITF",
  keywords: [
    "NSITF",
    "Nigeria Social Insurance Trust Fund",
    "agency management",
    "project management",
    "actuarial data",
  ],
  authors: [{ name: "NSITF", url: "https://nsitf.gov.ng" }],
  creator: "NSITF",
  publisher: "NSITF",
  icons: {
    icon: "/nsitf-logo.png",
    shortcut: "/nsitf-logo.png",
    apple: "/nsitf-logo.png",
  },
  openGraph: {
    title: "NSITF",
    description:
      "Secure access to Automated and Digital Actuarial Data Structure",
    url: "https://nsitf.gov.ng",
    siteName: "NSITF",
    images: [
      {
        url: "/nsitf-logo.png",
        width: 300,
        height: 297,
        alt: "NSITF Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NSITF",
    description:
      "Secure access to Automated and Digital Actuarial Data Structure",
    images: ["/nsitf-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <TanstackProvider>
          <LoadingBar />
          {children}
          <Toaster richColors />
        </TanstackProvider>
      </body>
    </html>
  );
}
