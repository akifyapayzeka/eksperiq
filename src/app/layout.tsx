import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { appConfig } from "@/lib/constants/app";
import { themeInitScript } from "@/lib/theme/theme-preference";
import { AuthProvider } from "@/lib/auth/auth-context";
import { RequireAuthGate } from "@/components/auth/require-auth-gate";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.productionUrl),
  title: `${appConfig.name} | İkinci el araç ilanı risk analizi`,
  description: appConfig.tagline,
  applicationName: appConfig.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: appConfig.shortName,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  openGraph: {
    title: `${appConfig.name} | İkinci el araç ilanı risk analizi`,
    description: appConfig.tagline,
    url: appConfig.productionUrl,
    siteName: appConfig.name,
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <Script id="eksperiq-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="safe-area-shell flex min-h-full flex-col bg-background text-foreground font-body">
        <AuthProvider>
          <RequireAuthGate>
            <SiteHeader />
            {children}
            <SiteFooter />
            <MobileBottomNav />
          </RequireAuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
