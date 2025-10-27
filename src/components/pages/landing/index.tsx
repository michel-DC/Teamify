import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { OrganizationsEventsSection } from "./organizations-events-section";
import { TestimonialsSection } from "./testimonials-section";
import { FAQSection } from "./faq-section";
import { CTASection } from "./cta-section";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function LandingPage() {
  return (
    <div 
      className="min-h-screen pt-24"
      style={
        {
          backgroundImage: "url('/images/background/background.svg')",
        }
      }
    >
      <Navbar />
      <div className="mb-16">
        <HeroSection />
        </div>
        <div id="how-it-works">
        <HowItWorksSection />
        </div>
        <div id="for-you">
        <OrganizationsEventsSection />
        </div>
        <div id="features">
        <FeaturesSection />
        </div>
        <div id="testimonials">
        <TestimonialsSection />
        </div>
        <div id="faq">
        <FAQSection />
        </div>
        <Footer />
    </div>
  );
}
