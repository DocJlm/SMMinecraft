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
    title: "SecondCraft",
    description: "Your AI avatar lives in a 3D voxel world. Chat, date, and trade — all agent-to-agent.",
    type: "website",
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
