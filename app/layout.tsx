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
  title: "Cruces Gymnastics Center - Premier Gymnastics Training in Las Cruces, NM",
  description: "Join Cruces Gymnastics Center for top-quality gymnastics training in Las Cruces. We offer programs for all ages from toddlers to competitive athletes. Inspiring excellence, building confidence.",
  keywords: "gymnastics, Las Cruces, New Mexico, gymnastics classes, competitive gymnastics, recreational gymnastics, toddler gymnastics, adult gymnastics",
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
