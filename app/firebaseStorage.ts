import { getStorage, ref, getDownloadURL } from "firebase/storage";
import app from "./lib/firebase";
// Initialize storage
const storage = getStorage(app);

// Function to fetch the file's download URL
export async function fetchFileURL(): Promise<string> {
    try {
        // Reference to the PNG file in storage
        const fileRef = ref(storage, "bm.png"); // Update this path

        // Fetch and return the download URL
        const url = await getDownloadURL(fileRef);
        return url;
    } catch (error) {
        console.error("Error fetching file URL:", error);
        throw error; // Rethrow the error to handle it in the caller
    }
}
