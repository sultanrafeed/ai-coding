import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Coding Platform",
  description: "Solve algorithmic problems with an AI co-pilot that actually understands your code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body><Providers>{children}</Providers></body>
      </html>
    </ClerkProvider>
  );
}
