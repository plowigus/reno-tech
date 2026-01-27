import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(2, {
        message: "Nazwa musi mieć co najmniej 2 znaki.",
    }),
    category: z.string().min(1, {
        message: "Kategoria jest wymagana.",
    }),
    description: z.string().min(10, {
        message: "Opis musi mieć co najmniej 10 znaków.",
    }),
    price: z.coerce.number().min(0.01, "Cena musi być większa od 0"),
    images: z.array(z.string()).min(1, {
        message: "Przynajmniej jedno zdjęcie jest wymagane.",
    }),
    sizes: z.array(z.string()).optional().default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
