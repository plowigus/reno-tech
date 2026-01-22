"use client";
import FloatingLines from "./FloatingLines";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-white/10 pt-20 pb-10 px-6 md:px-8">
      <div className="absolute top-0 left-0 z-1 h-full">
        <FloatingLines
          linesGradient={["#B10B1A", "#440E03", "#9C2007"]}
          animationSpeed={2}
          interactive
          bendRadius={10}
          bendStrength={0.6}
          mouseDamping={0.08}
          parallax={false}
          parallaxStrength={0}
          lineCount={5}
          enabledWaves={["top", "middle"]}
          lineDistance={20}
          middleWavePosition={{ x: 1, y: 1.3, rotate: -0.6 }}
          topWavePosition={{ x: 1, y: 1.3, rotate: -0.6 }}
        />
      </div>
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
              Specjaliści od elektroniki i elektryki samochodów Renault
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
                  className="text-gray-400 hover:text-white transition-colors font-light"
                >
                  +48 123 456 789
                </a>
              </li>
              <li>
                <a
                  href="mailto:kontakt@renotech.pl"
                  className="text-gray-400 hover:text-white transition-colors font-light"
                >
                  kontakt@renotech.pl
                </a>
              </li>
              <li className="text-gray-500 font-light">
                ul. Stefana Grota-Roweckiego 35/22
                <br />
                41-300 Bytom
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 font-light">
            © {currentYear} RenoTech. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-white transition-colors font-light"
            >
              Polityka Prywatności
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-white transition-colors font-light"
            >
              Regulamin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
