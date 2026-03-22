// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
const app = initializeApp(firebaseConfig)


import { getDatabase } from "firebase/database";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore, setDoc, doc, query, where } from "firebase/firestore";

const RTdb = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);




// Initialize Firebase
// const analytics = getAnalytics(app);
export default app;
export { RTdb, storage, auth, db };

export const authenticateWithFirebase = async (customToken: string) => {
    try {
        await signInWithCustomToken(auth, customToken);
        console.log("Firebase authentication successful!");
    } catch (error) {
        console.error("Error authenticating with Firebase:", error);
    }
}

interface User {
    id: string;
    username: string;
    email: string;
    lastseen: number;
}

interface Chat {
    chatsData: any[];
}

export const createFirebaseUser = async (username: string, email: string, id: string): Promise<void> => {
    const user: User = {
        id: id,
        username: username,
        email: email,
        lastseen: Date.now(),
    };

    const chat: Chat = {
        chatsData: [],
    };

    await setDoc(doc(db, "users", id), user);
    await setDoc(doc(db, "chats", id), chat);
}

interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    state: 'paused' | 'running' | 'success' | 'error' | 'canceled';
}

interface UploadTaskSnapshot {
    ref: any;
    bytesTransferred: number;
    totalBytes: number;
    state: 'paused' | 'running' | 'success' | 'error' | 'canceled';
}

interface UploadTask {
    on: (
        event: 'state_changed',
        nextOrObserver?: ((snapshot: UploadTaskSnapshot) => void) | null,
        error?: ((a: Error) => void) | null,
        complete?: (() => void) | null
    ) => void;
    snapshot: UploadTaskSnapshot;
}

export const upload = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now() + file.name}`);
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot: UploadProgress) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error: Error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};