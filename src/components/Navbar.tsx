import Image from "next/image";
import Logo from "../../public/renotech-logo.png";

const links = ["O nas", "Usługi", "Opinie", "Sklep", "Kontakt"];

export default function Navbar() {
  return (
    <header className="p-4 mb-8 z-10 relative">
      <div className="flex justify-between items-center">
        <div className="px-4 py-2 cursor-pointer">
          <Image src={Logo} alt="Logo firmy Renotech" />
        </div>
        <nav className="hidden md:flex gap-2 uppercase">
          {links.map((label) => (
            <div
              key={label}
              className="group relative px-3 py-1 text-sm font-medium tracking-wide transition-colors duration-150 hover:text-white cursor-pointer"
            >
              <span className="relative z-10">{label}</span>
              <span className="pointer-events-none absolute inset-x-2 -bottom-1 h-0.5 origin-left scale-x-0 bg-red-700/50 transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          ))}
        </nav>
        <div className="border border-white px-4 py-2 md:hidden">Menu</div>
      </div>
    </header>
  );
}
