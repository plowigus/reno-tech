import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(2, "Nazwa użytkownika musi mieć co najmniej 2 znaki"),
    email: z.string().email("Nieprawidłowy adres email"),
    role: z.enum(["user", "admin"]),
});

export type UserFormValues = z.infer<typeof userSchema>;
