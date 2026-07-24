import { Sora, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Mechanics_OS",
  description: "Engineering the business — internal operating system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${plexMono.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
