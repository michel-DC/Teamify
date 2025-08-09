import type { Metadata } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Teamify | Vos organisations",
  description: "...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} h-full bg-background text-foreground`}
    >
      <head>
        <link rel="icon" href="/images/logo/favicon.png" type="image/x-icon" />
      </head>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
