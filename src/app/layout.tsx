import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ketaflix",
  description:
    "A shared movie room with a darker, diary-style Letterboxd feel.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ketaflix",
  },
};

export const viewport: Viewport = {
  themeColor: "#14181c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
