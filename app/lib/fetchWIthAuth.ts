import { getSession } from "next-auth/react";

export const fetchWithAuth = async (
    url: string,
    options: RequestInit & { next?: { revalidate?: number } } = {}
) => {
    const session = await getSession();
    const accessToken = session?.user?.accessToken;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    return fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers ?? {}), // Ensure headers exist
        },
        next: options.next, // Pass the `next` object for revalidation if provided
    });
};
