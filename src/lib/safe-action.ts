import { z } from "zod";

export type ActionError = {
    error: string;
};

export type ActionSuccess<T> = {
    data: T;
};

export type ActionResponse<T> = ActionError | ActionSuccess<T>;

/**
 * Creates a safe server action with simplified internal error handling.
 * 
 * @param schema Zod schema for input validation (optional)
 * @param handler The async function to execute
 */
export async function createSafeAction<TInput, TOutput>(
    schema: z.Schema<TInput>,
    handler: (validatedData: TInput) => Promise<TOutput>
): Promise<ActionResponse<TOutput>> {
    try {
        // We assume the input comes from FormData or raw args that need parsing?
        // Actually, most of our actions take raw args. Let's adapt.
        // If we want a truly generic wrapper, we might need to change how actions are called.
        // For now, let's keep it simple: simpler wrapper for `try/catch` logic.

        // This is a placeholder for a more robust implementation like 'next-safe-action'.
        // Given current usage pattern (raw args), wrapping the WHOLE function might be tricky 
        // without changing signatures everywhere.

        // Let's implement a lighter helper to use INSIDE actions instead of wrapping the whole export.
        throw new Error("Generic wrapper not implemented yet. Use safeExecute instead.");
    } catch (e) {
        return { error: "Not implemented" };
    }
}

/**
 * Helper to safely execute logic and handle errors standardly.
 * Usage: return await safeExecute(async () => { ...logic... });
 */
export async function safeExecute<T>(block: () => Promise<T>): Promise<ActionResponse<T>> {
    try {
        const data = await block();
        return { data };
    } catch (error: any) {
        console.error("Action Error:", error);
        // Can add more specific error parsing here (e.g. Drizzle errors, Zod errors if thrown manually)
        return { error: error.message || "Wystąpił nieoczekiwany błąd." };
    }
}
