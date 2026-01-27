import { z } from "zod";

export const checkoutSchema = z.object({
    customerName: z.string().min(2, "Imię i nazwisko musi mieć co najmniej 2 znaki"),
    customerEmail: z.string().email("Nieprawidłowy adres email"),
    shippingStreet: z.string().min(3, "Adres musi mieć co najmniej 3 znaki"),
    shippingCity: z.string().min(2, "Miasto musi mieć co najmniej 2 znaki"),
    shippingPostalCode: z.string().regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi być w formacie XX-XXX"),
    shippingCountry: z.string().default("PL"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
