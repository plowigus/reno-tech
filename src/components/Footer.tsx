"use client";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-white/10 pt-20 pb-10 px-6 md:px-8">
      <div className="max-w-7xl mx-auto z-20 relative">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <a href="#home" className="inline-flex items-baseline mb-6 group">
              <span className="font-display text-4xl font-bold tracking-tighter text-white">
                RENO
              </span>
              <span className="font-display text-4xl font-bold tracking-tighter text-red-500">
                TECH
              </span>
            </a>
            <p className="text-gray-400 font-light leading-relaxed">
              RenoTech to profesjonalne serwis specjalizujący się w elektronice
              i elektryce samochodów Renault i Dacia. Z wieloletnim
              doświadczeniem oferujemy kompleksowe usługi od programowania
              sterowników, chip tuningu, aż po diagnostykę i doposażenie
              akcesoriami. Nasz zespół to pasjonaci motoryzacji gotowi do
              wyzwań.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm text-gray-600 uppercase tracking-wider mb-6">
              Nawigacja
            </h3>
            <ul className="space-y-3">
              {["Home", "Usługi", "Kontakt"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-400 hover:text-white transition-colors font-light"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm text-gray-600 uppercase tracking-wider mb-6">
              Kontakt
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+48123456789"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors font-light"
                >
                  <Phone size={18} className="flex-shrink-0" />
                  <span>+48 123 456 789</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:kontakt@renotech.pl"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors font-light"
                >
                  <Mail size={18} className="flex-shrink-0" />
                  <span>kontakt@renotech.pl</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 font-light">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <span>
                  ul. Stefana Grota-Roweckiego 35/22
                  <br />
                  41-300 Bytom
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 font-light">
            © {currentYear} RenoTech. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors font-light"
            >
              Polityka Prywatności
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors font-light"
            >
              Regulamin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
