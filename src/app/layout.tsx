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
  title: "SecondCraft - 3D Voxel Social World x SecondMe A2A",
  description: "A 3D voxel social world where your AI avatar socializes, dates, and trades with others. Powered by SecondMe A2A.",
  openGraph: {
    title: "SecondCraft - AI Avatars in a Voxel World",
    description: "Your AI avatar lives in a 3D voxel world. Chat, date, and trade — all agent-to-agent. Built for SecondMe A2A Hackathon.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SecondCraft" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SecondCraft - AI Avatars in a Voxel World",
    description: "Your AI avatar lives in a 3D voxel world. Chat, date, and trade — all agent-to-agent.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
