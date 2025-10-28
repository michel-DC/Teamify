import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Script from "next/script";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <html>
        <Script id="gtm-script" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
+'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P3XL2LQH');`}</Script>
      </html>
      <body>
        <noscript dangerouslySetInnerHTML={{
          __html: `<iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-P3XL2LQH\" height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe>`
        }} />
        <Navbar />
        <main className="flex-1 mx-auto max-w-3xl px-4 pt-28 pb-12">
          {children}
        </main>
        <Footer />
      </body>
    </div>
  );
}


