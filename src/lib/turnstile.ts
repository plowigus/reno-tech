export async function verifyTurnstile(token: string): Promise<boolean> {
    if (process.env.NODE_ENV === "development" && token === "mock-token") {
        return true;
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        console.error("TURNSTILE_SECRET_KEY is not defined");
        return false;
    }

    try {
        const formData = new FormData();
        formData.append("secret", secretKey);
        formData.append("response", token);

        const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: formData,
        });

        const data = await result.json();

        return data.success === true;
    } catch (error) {
        console.error("Turnstile verification error:", error);
        return false;
    }
}
