import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/renotech-logo.png";

const links = [
  { label: "O nas", href: "/#about" },
  { label: "Usługi", href: "/#services" },
  { label: "Opinie", href: "/#reviews" },
  { label: "Sklep", href: "/shop" },
  { label: "Kontakt", href: "/#contact" },
];

export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg shadow-black/20">
        <Link href="/" className="px-4 py-2 cursor-pointer block">
          <Image src={Logo} alt="Logo firmy Renotech" />
        </Link>
        <nav className="hidden md:flex gap-2 uppercase">
          {links.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="group px-3 py-1 text-sm font-medium text-white tracking-wide transition-colors duration-150 hover:text-white cursor-pointer"
            >
              <span className="relative z-50 inline-block">
                {label}
                <span className="absolute bottom-[-4px] left-0 w-full h-[1.5px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out" />
              </span>
            </Link>
          ))}
        </nav>
        <div className="border border-white px-4 py-2 md:hidden">Menu</div>
      </div>
    </header>
  );
}
