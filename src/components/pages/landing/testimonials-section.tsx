"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  avatar: string;
  content: string;
  rating: number;
  role: string;
  organization: string;
}

// Liste d'avis variés avec ratings différents adaptés à Teamify
const testimonials: Testimonial[] = [
  {
    name: "Marie Dubois",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    content:
      "Teamify a révolutionné la gestion de nos événements associatifs. L'interface est intuitive et nos bénévoles l'adoptent facilement !",
    rating: 5,
    role: "Présidente",
    organization: "Association Solidarité"
  },
  {
    name: "Thomas Martin",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    content:
      "La messagerie temps réel et les notifications automatiques nous font gagner un temps précieux dans l'organisation de nos séminaires.",
    rating: 4,
    role: "Responsable RH",
    organization: "TechCorp"
  },
  {
    name: "Sophie Laurent",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    content:
      "Les analytics et tableaux de bord nous donnent une visibilité complète sur nos événements. Un outil indispensable !",
    rating: 5,
    role: "Event Manager",
    organization: "EventPro"
  },
  {
    name: "Pierre Moreau",
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
    content:
      "La création d'organisations avec rôles personnalisés nous permet de structurer parfaitement nos équipes projets.",
    rating: 3,
    role: "Chef de Projet",
    organization: "StartupInnov"
  },
  {
    name: "Camille Rousseau",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content:
      "J'adore pouvoir inviter automatiquement les participants et suivre les inscriptions en temps réel.",
    rating: 4,
    role: "Coordinatrice",
    organization: "Formation Plus"
  },
  {
    name: "Alexandre Petit",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    content:
      "Teamify m'aide à organiser mes ateliers de formation de manière professionnelle, même en tant qu'auto-entrepreneur.",
    rating: 2,
    role: "Formateur",
    organization: "Formation Indépendante"
  },
  {
    name: "Julie Bernard",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    content:
      "La recherche intelligente me permet de retrouver instantanément tous mes événements passés et conversations.",
    rating: 5,
    role: "Directrice",
    organization: "Agence Communication"
  },
  {
    name: "Nicolas Durand",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    content: "Un outil complet pour gérer nos conférences et networking events. La qualité est au rendez-vous !",
    rating: 3,
    role: "Organisateur",
    organization: "Business Network"
  },
  {
    name: "Isabelle Leroy",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    content:
      "La sécurité et la confidentialité des données sont excellentes. Je peux organiser mes événements en toute sérénité.",
    rating: 4,
    role: "Responsable Sécurité",
    organization: "SecureEvents"
  },
  {
    name: "Fabien Garcia",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    content:
      "Les suggestions intelligentes pour l'organisation d'événements sont toujours pertinentes et utiles.",
    rating: 5,
    role: "Event Planner",
    organization: "Wedding Dreams"
  },
  {
    name: "Claire Moreau",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    content:
      "Le mode collaboratif est parfait pour travailler en équipe sur nos événements corporate multi-sites.",
    rating: 2,
    role: "Chef d'Équipe",
    organization: "Corporate Events"
  },
  {
    name: "Antoine Blanc",
    avatar: "https://randomuser.me/api/portraits/men/53.jpg",
    content: "J'ai gagné en productivité et en organisation grâce à Teamify. Mes événements sont mieux structurés.",
    rating: 5,
    role: "Fondateur",
    organization: "Innovation Hub"
  },
  {
    name: "Valérie Simon",
    avatar: "https://randomuser.me/api/portraits/women/53.jpg",
    content:
      "La qualité des fonctionnalités est impressionnante, même pour des événements techniques complexes.",
    rating: 4,
    role: "Ingénieure",
    organization: "Tech Solutions"
  },
  {
    name: "Marc Lefebvre",
    avatar: "https://randomuser.me/api/portraits/men/93.jpg",
    content: "La prise en main est immédiate, même pour les équipes non-techniques. Formation minimale requise !",
    rating: 4,
    role: "Manager",
    organization: "Team Management"
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8 flex flex-col gap-3 sm:gap-4 min-w-[280px] sm:min-w-[320px] md:min-w-[340px] max-w-[320px] sm:max-w-[360px] md:max-w-[380px] h-[200px] sm:h-[220px] md:h-[230px] justify-between transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="flex items-center gap-3 sm:gap-4 mb-1">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm sm:text-base">
            {testimonial.name}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            {testimonial.role} • {testimonial.organization}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-1">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star
            key={i}
            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400 fill-current"
          />
        ))}
        {[...Array(5 - testimonial.rating)].map((_, i) => (
          <Star
            key={i}
            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-200"
          />
        ))}
      </div>
      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
        {testimonial.content}
      </p>
    </div>
  );
}

export function TestimonialsSection() {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    let animationFrame: number;
    let start: number | null = null;
    let lastTimestamp = 0;
    let px = 0;
    const speed = 0.5; // pixels par frame

    function step(timestamp: number) {
      if (!slider) return;
      if (start === null) start = timestamp;
      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      px += speed * (elapsed / 16.67); // ajustement pour 60fps
      if (!slider) return;
      if (slider.scrollLeft + 1 >= slider.scrollWidth - slider.clientWidth) {
        px = 0;
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft = px;
      }
      animationFrame = requestAnimationFrame(step);
    }
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Pour l'effet infini, on duplique les avis
  const allTestimonials = [...testimonials, ...testimonials];
  const half = Math.ceil(allTestimonials.length / 2);

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#262626] mb-6">
            Ils nous font{" "}
            <span className="text-[#7C3AED]">confiance</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#262626]/70 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment nos utilisateurs transforment leur gestion d'événements avec Teamify
          </p>
        </div>

        <div
          ref={sliderRef}
          className="overflow-x-auto scrollbar-hide flex flex-col gap-6 sm:gap-8 md:gap-10"
          style={{ scrollBehavior: "auto" }}
        >
          {/* Ligne 1 */}
          <div className="flex gap-4 sm:gap-6 md:gap-8 mb-2">
            {allTestimonials.slice(0, half).map((t, i) => (
              <TestimonialCard testimonial={t} key={"t1-" + i} />
            ))}
          </div>
          {/* Ligne 2, décalée */}
          <div className="flex gap-4 sm:gap-6 md:gap-8 opacity-80 ml-12 sm:ml-16 md:ml-24 lg:ml-32 xl:ml-40 2xl:ml-48">
            {allTestimonials.slice(half).map((t, i) => (
              <TestimonialCard testimonial={t} key={"t2-" + i} />
            ))}
          </div>
        </div>

        {/* Éléments décoratifs de fond */}
        <div className="hidden sm:block absolute top-20 left-0 w-32 h-32 bg-[#7C3AED]/5 rounded-full blur-3xl"></div>
        <div className="hidden sm:block absolute bottom-20 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}