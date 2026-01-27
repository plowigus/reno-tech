import { auth } from "@/auth";
import { getCart } from "@/app/actions/cart-actions";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/checkout");
    }

    // specific fetching to get address details
    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.user.id)
    });

    const user = {
        ...session.user,
        ...dbUser // Override session fields with DB fields (street, city, etc.)
    };

    const cart = await getCart();

    if (!cart || cart.items.length === 0) {
        // We could redirect here or show empty state in Client Component
        // Let's pass null and let component handle
    }

    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <CheckoutForm user={user} initialCart={cart || null} />
            </div>
        </main>
    );
}
