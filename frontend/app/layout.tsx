import type { Metadata } from "next";
import { playfair, inter, chomsky } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "The News Portal",
  description: "Breaking news, analysis, and opinion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} ${chomsky.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
