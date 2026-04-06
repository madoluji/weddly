import { useEffect } from "react";
import { auth, authenticateWithFirebase } from "@/app/lib/firebase";
import { fetchWithAuth } from "../lib/fetchWIthAuth";
import { useAuth } from "../providers";

let firebaseAuthInFlight: Promise<void> | null = null;
let lastAuthedUserId: string | null = null;

const useFirebaseAuth = () => {
    const { session, status } = useAuth();

    useEffect(() => {
        const fetchFirebaseToken = async () => {
            const sessionUserId = session?.user?.id;
            if (status !== "authenticated" || !sessionUserId) {
                return;
            }

            if (auth.currentUser?.uid === sessionUserId || lastAuthedUserId === sessionUserId) {
                return;
            }

            try {
                if (firebaseAuthInFlight) {
                    await firebaseAuthInFlight;
                    return;
                }

                firebaseAuthInFlight = (async () => {
                    const res = await fetchWithAuth("/api/firebase-token");
                    const { token } = await res.json();
                    await authenticateWithFirebase(token);
                    lastAuthedUserId = sessionUserId;
                })();

                await firebaseAuthInFlight;
            } catch (error) {
                console.error("Error fetching Firebase token:", error);
            } finally {
                firebaseAuthInFlight = null;
            }
        };

        fetchFirebaseToken();
    }, [session, status]);
};

export default useFirebaseAuth;
