import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Type the handler properly for TypeScript
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };
