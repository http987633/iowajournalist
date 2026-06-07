import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-zinc-50 font-sans text-zinc-900 antialiased">
        {children}
        <Script
          id="LA_COLLECT"
          src="https://sdk.51.la/js-sdk-pro.min.js"
          strategy="afterInteractive"
          charSet="UTF-8"
        />
        <Script id="LA_INIT" strategy="afterInteractive">
          {`LA.init({id:"3LP8kfayuIkeNzcp",ck:"3LP8kfayuIkeNzcp"})`}
        </Script>
      </body>
    </html>
  );
}
