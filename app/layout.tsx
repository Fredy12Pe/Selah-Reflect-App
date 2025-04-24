import "./globals.css";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Selah - Daily Reflections",
  description: "A space for daily devotions and reflections",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
