import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ranbir Khurana | Full Stack Dev",
  description: "Portfolio of Ranbir Khurana. Exploring ideas, building projects, and crafting digital experiences.",
  metadataBase: new URL('https://commitsofme.appwrite.network'),
  openGraph: {
    title: "Ranbir Khurana | Full Stack Dev",
    description: "Portfolio of Ranbir Khurana. Exploring ideas, building projects, and crafting digital experiences.",
    url: "https://commitsofme.appwrite.network",
    siteName: "Ranbir Khurana",
    images: [
      {
        url: "/vercel.png",
        width: 1200,
        height: 630,
        alt: "Ranbir Khurana Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ranbir Khurana | Full Stack Dev",
    description: "Portfolio of Ranbir Khurana. Exploring ideas, building projects, and crafting digital experiences.",
    images: ["/vercel.png"],
  },
  icons: {
    icon: "/vercel.png",
    shortcut: "/vercel.png",
    apple: "/vercel.png",
  },
};
import Preloader from "@/components/Preloader";
import GlobalRadialMenu from "@/components/GlobalRadialMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <GlobalRadialMenu>
          <Preloader />
          {children}
        </GlobalRadialMenu>
      </body>
    </html>
  );
}
