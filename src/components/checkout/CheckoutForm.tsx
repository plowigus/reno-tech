"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validators/checkout-schema";
import { createOrder } from "@/app/actions/checkout-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItem {
    id: string;
    quantity: number;
    size: string | null;
    product: {
        id: string;
        name: string;
        price: string;
        image: string;
    };
}

interface CartData {
    id: string;
    items: CartItem[];
}

interface CheckoutFormProps {
    user: any;
    initialCart: CartData | null;
}

export function CheckoutForm({ user, initialCart }: CheckoutFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            customerName: user?.name || "",
            customerEmail: user?.email || "",
            shippingStreet: user?.street || "",
            shippingCity: user?.city || "",
            shippingPostalCode: user?.postalCode || "",
            shippingCountry: user?.country || "PL",
        },
    });

    const items = initialCart?.items || [];
    const subtotal = items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
    const shippingCost = 9.99;
    const total = subtotal + shippingCost;

    const onSubmit = async (data: CheckoutFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createOrder(data);
            if (result.error) {
                toast.error(result.error);
            } else if (result.redirectUrl) {
                router.push(result.redirectUrl);
            }
        } catch (error) {
            toast.error("Wystąpił błąd");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!initialCart || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400">
                <p>Twój koszyk jest pusty.</p>
                <Button variant="link" onClick={() => router.push("/shop")} className="text-white underline mt-4">Wróć do sklepu</Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
            {/* LEFT: Address Form */}
            <div className="lg:col-span-7">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Dane do wysyłki</h2>
                    <p className="text-zinc-500 text-sm">Wypełnij poniższe dane, abyśmy mogli zrealizować zamówienie.</p>
                </div>

                <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Imię i Nazwisko</label>
                            <Input
                                {...form.register("customerName")}
                                className="bg-zinc-900 border-white/10 text-white focus:border-red-500"
                                placeholder="Jan Kowalski"
                            />
                            {form.formState.errors.customerName && (
                                <p className="text-red-500 text-xs">{form.formState.errors.customerName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Email</label>
                            <Input
                                {...form.register("customerEmail")}
                                className="bg-zinc-900 border-white/10 text-white focus:border-red-500"
                                placeholder="jan@example.com"
                            />
                            {form.formState.errors.customerEmail && (
                                <p className="text-red-500 text-xs">{form.formState.errors.customerEmail.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Ulica i numer</label>
                        <Input
                            {...form.register("shippingStreet")}
                            className="bg-zinc-900 border-white/10 text-white focus:border-red-500"
                            placeholder="ul. Przykładowa 1/2"
                        />
                        {form.formState.errors.shippingStreet && (
                            <p className="text-red-500 text-xs">{form.formState.errors.shippingStreet.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Kod pocztowy</label>
                            <Input
                                {...form.register("shippingPostalCode")}
                                className="bg-zinc-900 border-white/10 text-white focus:border-red-500"
                                placeholder="00-000"
                            />
                            {form.formState.errors.shippingPostalCode && (
                                <p className="text-red-500 text-xs">{form.formState.errors.shippingPostalCode.message}</p>
                            )}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-zinc-400">Miasto</label>
                            <Input
                                {...form.register("shippingCity")}
                                className="bg-secondary border-border text-foreground focus:border-red-500"
                                placeholder="Warszawa"
                            />
                            {form.formState.errors.shippingCity && (
                                <p className="text-red-500 text-xs">{form.formState.errors.shippingCity.message}</p>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* RIGHT: Summary */}
            <div className="lg:col-span-5 space-y-8">
                <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 sticky top-32">
                    <h3 className="text-xl font-bold text-white mb-6">Podsumowanie</h3>

                    {/* Items List */}
                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="relative w-12 h-16 bg-white/5 rounded overflow-hidden shrink-0">
                                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-medium truncate">{item.product.name}</p>
                                    {item.size && <p className="text-xs text-zinc-500">Rozmiar: {item.size}</p>}
                                    <p className="text-xs text-zinc-400">{item.quantity} x {Number(item.product.price).toFixed(2)} PLN</p>
                                </div>
                                <div className="text-sm font-mono text-white">
                                    {(Number(item.product.price) * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Costs */}
                    <div className="space-y-3 pt-6 border-t border-border">
                        <div className="flex justify-between text-sm text-zinc-400">
                            <span>Suma częściowa</span>
                            <span>{subtotal.toFixed(2)} PLN</span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-400">
                            <span>Dostawa</span>
                            <span>{shippingCost.toFixed(2)} PLN</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border">
                            <span>Do zapłaty</span>
                            <span className="text-red-500">{total.toFixed(2)} PLN</span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mt-8">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Metoda płatności</p>
                        <div className="flex items-center gap-3 p-4 border border-red-500/50 bg-red-500/10 rounded-lg">
                            <div className="w-4 h-4 rounded-full border-[5px] border-red-500 shadow-sm" />
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-white">Przelewy24 / BLIK</span>
                                <span className="block text-xs text-zinc-400">Szybka płatność online</span>
                            </div>
                            <ShieldCheck size={18} className="text-red-500" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        form="checkout-form"
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-white hover:bg-zinc-200 text-black font-black uppercase py-4 rounded-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                    >
                        <span className="flex items-center justify-center gap-2 w-full">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Lock size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />}
                            <span>{isSubmitting ? "Przetwarzanie..." : "Zamawiam i płacę"}</span>
                        </span>
                    </Button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-600">
                        <Lock size={12} />
                        <span>Bezpieczna płatność SSL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
