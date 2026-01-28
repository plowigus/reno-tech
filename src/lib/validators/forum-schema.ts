import { z } from "zod";

export const createPostSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Tytuł musi mieć co najmniej 5 znaków." })
        .max(100, { message: "Tytuł nie może przekraczać 100 znaków." }),
    content: z
        .string()
        .min(10, { message: "Treść posta musi mieć co najmniej 10 znaków." }),
    categoryId: z.string().uuid({ message: "Nieprawidłowy identyfikator kategorii." }),
});

export const createCommentSchema = z.object({
    content: z
        .string()
        .min(2, { message: "Komentarz musi mieć co najmniej 2 znaki." }),
    postId: z.string().uuid({ message: "Nieprawidłowy identyfikator posta." }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
