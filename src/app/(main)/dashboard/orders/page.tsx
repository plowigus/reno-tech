
import { auth } from "@/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn, formatDatePL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, session.user.id),
        orderBy: desc(orders.createdAt),
        with: {
            items: {
                with: {
                    product: true,
                },
            },
        },
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle size={12} />
                        Opłacone
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        <Clock size={12} />
                        Oczekujące
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        <XCircle size={12} />
                        Anulowane
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Moje Zamówienia</h1>
                <p className="text-zinc-400">Historia Twoich zakupów.</p>
            </div>

            {userOrders.length > 0 ? (
                <div className="space-y-6">
                    {userOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
                        >
                            {/* Header */}
                            <div className="bg-white/5 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-mono font-bold">#{order.p24SessionId?.replace('order_', '').slice(0, 8) || order.id.slice(0, 8)}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Data: {formatDatePL(order.createdAt)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-zinc-400">Suma</p>
                                    <p className="text-xl font-bold text-white font-mono">
                                        {Number(order.totalAmount).toFixed(2)} PLN
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                    <div className="flex -space-x-3 overflow-hidden py-2">
                                        {order.items.slice(0, 4).map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative w-12 h-12 rounded-lg border-2 border-zinc-900 overflow-hidden bg-zinc-800"
                                                title={item.product.name}
                                            >
                                                <Image
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="relative w-12 h-12 rounded-lg border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        {order.items.length === 1 ? (
                                            <p className="text-sm text-zinc-300 font-medium">
                                                {order.items[0].product.name}
                                                {order.items[0].size && <span className="text-zinc-500 ml-2">({order.items[0].size})</span>}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-zinc-300 font-medium">
                                                {order.items.length} produkty
                                            </p>
                                        )}
                                        <p className="text-xs text-zinc-500">
                                            Dostawa na: {order.shippingCity}, {order.shippingStreet}
                                        </p>
                                    </div>
                                    {/* Link to details (future) */}
                                    {/* <button className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                                        Szczegóły
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-6">
                        <Package size={32} className="text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nie masz jeszcze żadnych zamówień</h3>
                    <p className="text-zinc-400 max-w-sm mx-auto mb-8">
                        Kiedy złożysz pierwsze zamówienie, pojawi się ono tutaj.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-lg transition-colors font-bold uppercase tracking-wide"
                    >
                        Przeglądaj sklep
                    </Link>
                </div>
            )}
        </div>
    );
}
