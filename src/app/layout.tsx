import type { Metadata } from "next";
import "./page.tsx";

export const metadata: Metadata = {
  title: "810ch",
  description: "This website is powered by Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
