import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Teamify • Gestion d'événements en équipe",
  description:
    "Avec teamify vous pouvez gérer vos événements en équipe de manière simple et efficace.",
  icons: {
    icon: "/images/logo/favicon.svg"
  },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full bg-background text-foreground"
    >
      <Script id="gtm-script" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P3XL2LQH');`}</Script>
      <body className={`${bricolageGrotesque.variable} font-bricolage-grotesque`}>
        <noscript dangerouslySetInnerHTML={{
          __html: `<iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-P3XL2LQH\" height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe>`
        }} />
        {children}
      </body>
    </html>
  );
}