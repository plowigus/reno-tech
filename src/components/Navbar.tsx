import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/renotech-logo.png";
import { auth } from "@/auth";
import UserNav from "./UserNav";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CartSheet } from "@/components/cart/CartSheet";
import { WishlistButton } from "@/components/nav/WishlistButton";
import { getWishlistCount } from "@/app/actions/wishlist-actions";
import { WishlistCounterSync } from "@/components/nav/WishlistCounterSync";
import { CartSyncer } from "@/components/cart/CartSyncer";

const links = [
  { label: "O nas", href: "/#about" },
  { label: "Usługi", href: "/#services" },
  { label: "Opinie", href: "/#reviews" },
  { label: "Sklep", href: "/shop" },
  { label: "Kontakt", href: "/#contact" },
];

export default async function Navbar() {
  const session = await auth();
  const wishlistCount = await getWishlistCount();

  let user = session?.user;

  if (session?.user?.id) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (dbUser) {
      user = {
        ...session.user,
        ...dbUser,
        role: dbUser.role || "user"
      };
    }
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300">
      <WishlistCounterSync initialCount={wishlistCount} />
      <div className="max-w-7xl mx-auto backdrop-blur-md bg-background/40 border border-border rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg shadow-black/20">
        <Link href="/" className="px-4 py-2 cursor-pointer block">
          <Image src={Logo} alt="Logo firmy Renotech" />
        </Link>
        <nav className="hidden md:flex gap-2 uppercase items-center">
          {links.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="group px-3 py-1 text-sm font-medium text-foreground tracking-wide transition-colors duration-150 hover:text-foreground cursor-pointer"
            >
              <span className="relative z-50 inline-block">
                {label}
                <span className="absolute bottom-[-4px] left-0 w-full h-[1.5px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out" />
              </span>
            </Link>
          ))}
          <div className="ml-4 pl-4 border-l border-border flex items-center gap-4">
            <WishlistButton />
            <CartSyncer userId={user?.id} />
            <CartSheet />
            <UserNav user={user} />
          </div>
        </nav>
        <div className="border border-border px-4 py-2 md:hidden">Menu</div>
      </div>
    </header>
  );
}
