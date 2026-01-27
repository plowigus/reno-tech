import { HeroBackground } from "./HeroBackground";
import { IntroOverlay } from "./IntroOverlay";
import { HeroContent } from "./HeroContent";
import { MatrixText } from "./Animation/MatrixText";
import { Clock } from "./Clock";
import { Facebook, Instagram, Phone, ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="min-h-screen relative bg-background text-foreground overflow-hidden">

      {/* 1. Tło 3D (Client) */}
      <HeroBackground />

      {/* 2. Intro (Client - znika po chwili) */}
      <IntroOverlay />

      {/* 3. Statyczna Treść (Server + Client Wrapper) */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-20 pointer-events-none">
        <HeroContent>
          <div className="px-4 py-2 mb-2 text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter">
            RENO<span className="text-red-700">tech.</span>
          </div>

          <div className="px-4 py-2 text-center text-lg md:text-2xl uppercase tracking-[0.2em] w-full flex justify-center font-light">
            <MatrixText />
          </div>
        </HeroContent>
      </div>

      {/* 4. Stopka */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm relative">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center font-mono text-foreground text-base md:text-md tracking-wide">
              <Clock />
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground">
            <ChevronDown size={24} className="text-foreground/50 animate-bounce" />
          </div>

          <div className="flex items-center gap-6 pointer-events-auto">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-red-600 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="tel:+48123456789" className="text-muted-foreground hover:text-foreground transition-colors">
              <Phone size={20} />
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}