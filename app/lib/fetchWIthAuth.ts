import { getAuthSessionSnapshot } from "@/app/providers";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithAuth = async (
    url: string,
    options: RequestInit & { next?: { revalidate?: number } } = {}
) => {
    const session = getAuthSessionSnapshot();
    const accessToken = session?.user?.accessToken;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    const requestOptions = {
        ...options,
        headers: {
            ...headers,
            ...(options.headers ?? {}),
        },
        next: options.next,
    };

    try {
        return await fetch(url, requestOptions);
    } catch (error) {
        // Next.js dev restarts can cause a brief network outage in the browser.
        if (typeof window !== "undefined") {
            await wait(350);
            try {
                return await fetch(url, requestOptions);
            } catch {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: "Network temporarily unavailable. Please retry.",
                    }),
                    {
                        status: 503,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        }

        throw error;
    }
};
