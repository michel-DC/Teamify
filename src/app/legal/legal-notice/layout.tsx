import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Script from "next/script";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-4 pt-28 pb-12">
        {children}
      </main>
      <Footer />
    </>
  );
}


