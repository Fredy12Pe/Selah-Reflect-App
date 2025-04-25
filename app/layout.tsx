import "./globals.css";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Selah - Daily Reflections",
  description: "A space for daily devotions and reflections",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Selah",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Selah" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Selah" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />

        {/* Apple Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash.png" />
      </head>
      <body className={outfit.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
