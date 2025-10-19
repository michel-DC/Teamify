import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { TestimonialsSection } from "./testimonials-section";
import { CTASection } from "./cta-section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function LandingPage() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/background/background.svg')"
      }}
    >
      <Navbar />
      <div className="m-80">
        
      </div>
      <Footer />
    </div>
  );
}
