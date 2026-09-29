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

export const metadata = {
  title: "Chauka - a data story from Manus Island",
  description:
    "Sea level rise in the Pacific, told with data and with storytelling from Manus Island, Papua New Guinea. Sound on for the full experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`font-arial-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
