import type { Metadata, Viewport } from "next";
import "@fontsource/unbounded/400.css";
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/900.css";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  openGraph: { title: site.title, description: site.description, type: "website" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = { themeColor: "#02040A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
