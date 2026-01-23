"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, Navigation, Key, Zap, Fuel, Package, Check } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: "01",
    title: "Programowanie Sterowników",
    description:
      "Aktualizacje i reprogi sterowników w Renault i Dacia. Zwiększanie wydajności, usuwanie limitów czy dodawanie nowych funkcji.",
    icon: Cpu,
  },
  {
    number: "02",
    title: "Nawigacje i Multimedia",
    description:
      "Aktualizacja map, Android Auto, CarPlay. Nowoczesne systemy multimedialne dla Twojego samochodu.",
    icon: Navigation,
  },
  {
    number: "03",
    title: "Karty Hands Free",
    description:
      "Kodowanie i dorabianie kart dostępu. Bezpieczny dostęp do pojazdu bez tradycyjnego kluczyka.",
    icon: Key,
  },
  {
    number: "04",
    title: "Diagnostyka",
    description:
      "Kompleksowa diagnostyka i naprawa elektryki. Szybkie wykrywanie i rozwiązywanie problemów.",
    icon: Zap,
  },
  {
    number: "05",
    title: "Chip Tuning",
    description:
      "Zwiększenie mocy lub optymalizacja zużycia paliwa. Dostosowanie pojazdu do Twoich potrzeb.",
    icon: Fuel,
  },
  {
    number: "06",
    title: "Doposażenie",
    description:
      "Kamery, czujniki, LED i akcesoria. Rozszerz możliwości Twojego samochodu o nowoczesne gadżety.",
    icon: Package,
  },
];

const whyPoints = [
  "Dojeżdżamy na miejsce w regionie",
  "Oprogramowanie i mapy najnowsze wersje",
  "Bezpieczeństwo danych i kopie zapasowe",
  "Sprzęt serwisowy dedykowany Renault / Dacia",
];

export function Services() {
  const containerRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // ... (keep existing GSAP logic)
      const items = itemsRef.current;
      const validItems = items.filter((item): item is HTMLDivElement => item !== null);
      const totalItems = validItems.length;

      const ITEM_SPACING = 220;

      // Initial Setup
      validItems.forEach((item, i) => {
        const initialY = i * ITEM_SPACING;

        let initialOpacity = 0;
        let initialScale = 0.8;

        if (i === 0) {
          initialOpacity = 1;
          initialScale = 1;
        } else if (i === 1) {
          initialOpacity = 0.4;
          initialScale = 0.9;
        } else if (i === 2) {
          initialOpacity = 0.1;
          initialScale = 0.85;
        }

        gsap.set(item, {
          y: initialY,
          autoAlpha: initialOpacity,
          scale: initialScale,
          transformOrigin: "center center"
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalItems * 220}`, // Wait until last item is fully shown
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (totalItems - 1),
            duration: { min: 0.3, max: 0.8 },
            delay: 0,
            ease: "back.out(2)",
          },
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      validItems.forEach((_, i) => {
        if (i === validItems.length - 1) return;

        const stepTl = gsap.timeline();
        const easeType = "power2.inOut";

        // Item i goes up
        if (validItems[i]) {
          stepTl.to(validItems[i], {
            y: -ITEM_SPACING,
            autoAlpha: 0,
            scale: 0.8,
            duration: 1,
            ease: easeType
          }, 0);
        }

        // Item i+1 becomes active
        if (validItems[i + 1]) {
          stepTl.to(validItems[i + 1], {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 1,
            ease: easeType
          }, 0);
        }

        // Item i+2 moves into 'next' spot
        if (validItems[i + 2]) {
          stepTl.to(validItems[i + 2], {
            y: ITEM_SPACING,
            autoAlpha: 0.4,
            scale: 0.9,
            duration: 1,
            ease: easeType
          }, 0);
        }

        // Item i+3 moves into 'upcoming' spot
        if (validItems[i + 3]) {
          stepTl.to(validItems[i + 3], {
            y: 2 * ITEM_SPACING,
            autoAlpha: 0.1,
            scale: 0.85,
            duration: 1,
            ease: easeType
          }, 0);
        }

        tl.add(stepTl);
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="bg-black text-white min-h-screen flex items-start relative select-none pb-24 z-10"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 px-4 w-full h-full pt-32 lg:pt-40">
        {/* Left: Why us */}
        <div className="flex flex-col gap-8 relative z-20">
          <div className="bg-red-600/5 border border-red-600/15 rounded-2xl p-8 md:p-10 flex flex-col gap-8 backdrop-blur-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-red-500 mb-3">
                Dlaczego my
              </p>
              <h3 className="text-3xl md:text-4xl font-black leading-tight">
                Sprawdzony serwis
                <span className="text-red-500"> elektroniki</span> Renault
              </h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Mobilnie lub stacjonarnie. Szybka diagnostyka, programowanie
              sterowników, multimedia, karty HF i doposażenie.
            </p>
            <div className="space-y-4">
              {whyPoints.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-red-600/15 rounded-md">
                    <Check size={16} className="text-red-500" />
                  </div>
                  <p className="text-gray-200 text-base md:text-lg leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Rolling List */}
        <div className="relative h-full w-full flex items-start justify-center">
          <div className="relative w-full max-w-xl">
            <div className="relative w-full h-[0px]">
              {services.map((service, index) => (
                <div
                  key={service.number}
                  ref={(el) => {
                    itemsRef.current[index] = el;
                  }}
                  className="absolute w-full px-4 left-0 right-0 top-0"
                >
                  <ServiceItem
                    service={service}
                    icon={service.icon}
                    isActive={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Background overlay to hide any ScrollTrigger pin seams */}
      <div className="absolute inset-0 bg-black -z-50 pointer-events-none" />
    </section>
  );
}

interface ServiceItemProps {
  service: (typeof services)[0];
  icon: React.ElementType;
  isActive: boolean;
}

function ServiceItem({
  service,
  icon: IconComponent,
  isActive,
}: ServiceItemProps) {
  return (
    <div className="service-item-wrapper border-b border-red-600/15 last:border-0 backdrop-blur-md bg-black/40 rounded-3xl border border-red-600/10">
      <div className="flex gap-6 md:gap-10 items-center">
        {/* Number & Icon */}
        <div className="shrink-0 relative">
          <div className="absolute -top-8 -left-6 text-7xl md:text-9xl font-black text-red-600/[0.04] leading-none pointer-events-none select-none">
            {service.number}
          </div>
          <div
            className={cn(
              "relative z-10 p-5 rounded-2xl transition-colors duration-500",
              "bg-red-600/20"
            )}
          >
            <IconComponent
              size={42}
              className="text-red-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-xl md:text-3xl font-black mb-4 text-white tracking-tight">
            {service.title}
          </h3>
          <p className="text-base md:text-lg leading-relaxed text-gray-300">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
}
