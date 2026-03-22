import User from "@/models/user";
import { NextAuthOptions } from "next-auth";
import { connectMongoDB } from "./mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { type DefaultSession, type DefaultUser } from "next-auth";
import Admin from "@/models/admin";
import { SignJWT } from "jose";

// Extend the NextAuth User and Session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      name: string;
      email: string;
      lastName: string;
      id: string;
      role: string;
      profilePicture?: string;
      accessToken?: string;
    };
  }
  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    lastName: string;
    role: string;
    profilePicture?: string;
    emailVerified?: boolean;
    kycVerified?: boolean;
    accessToken?: string;
    isFirstLogin?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { email, password } = credentials;
        try {
          await connectMongoDB();
          let user = await User.findOne({ email });

          if (!user) {
            const admin = await Admin.findOne({ userName: email });
            if (admin) {
              const isPasswordValid = await bcrypt.compare(
                password,
                admin.password
              );
              if (isPasswordValid) {
                const secretKey = new TextEncoder().encode(
                  process.env.ACCCESS_TOKEN_SECRET_KEY
                );
                const accessToken = await new SignJWT({
                  email,
                  name: admin.name,
                  lastname: admin.lastName,
                  id: admin._id.toString(),
                  role: admin.role,
                  isFirstLogin: admin.isFirstLogin || false,
                })
                  .setProtectedHeader({ alg: "HS256" })
                  .sign(secretKey);
                return {
                  name: admin.name,
                  lastName: admin.lastName,
                  email: admin.userName,
                  id: admin._id.toString(),
                  role: "admin",
                  accessToken,
                };
              }
            }
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            console.log("Password mismatch for user:", email);
            return null;
          }

          const secretKey = new TextEncoder().encode(
            process.env.ACCCESS_TOKEN_SECRET_KEY
          );
          const accessToken = await new SignJWT({
            email,
            name: user.name,
            lastName: user.lastName,
            emailVerified: user.emailVerified,
            kycVerified: user.kycVerified,
            id: user._id.toString(),
            isFirstLogin: user.isFirstLogin || false,
          })
            .setProtectedHeader({ alg: "HS256" })
            .sign(secretKey);
          return {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture,
            role: "user",
            id: user._id.toString(),
            emailVerfied: user.emailVerified,
            kycVerified: user.kycVerified,
            accessToken,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await connectMongoDB();
        const existingUser = await User.findOne({ email: user.email });

        let [name, ...lastNameParts] = user.name.split(" ");
        let lastName = lastNameParts.join(" ") || "";

        if (!existingUser) {
          const newUser = await User.create({
            name,
            lastName,
            email: user.email,
            profilePicture: user.image,
            emailVerified: true,
            oauth: true,
            isFirstLogin: true,
          });

          const secretKey = new TextEncoder().encode(
            process.env.ACCCESS_TOKEN_SECRET_KEY
          );
          const accessToken = await new SignJWT({
            email: user.email,
            name: user.name,
            lastname: user.lastName,
            id: newUser._id.toString(),
            emailVerfied: user.emailVerified,
            kycVerified: user.kycVerified,
          })
            .setProtectedHeader({ alg: "HS256" })
            .sign(secretKey);

          user.id = newUser._id.toString();
          user.name = name;
          user.lastName = lastName;
          user.role = "user";
          user.profilePicture = newUser.profilePicture;
          user.accessToken = accessToken;
          user.emailVerified = newUser.emailVerified;
          user.kycVerified = newUser.kycVerified;
        } else {
          // Use existing user data
          const secretKey = new TextEncoder().encode(
            process.env.ACCCESS_TOKEN_SECRET_KEY
          );
          const accessToken = await new SignJWT({
            email: user.email,
            name: user.name,
            lastname: user.lastName,
            id: existingUser._id.toString(),
            emailVerified: existingUser.emailVerified,
            kycVerified: existingUser.kycVerified,
          })
            .setProtectedHeader({ alg: "HS256" })
            .sign(secretKey);

          user.id = existingUser._id.toString();
          user.name = existingUser.name;
          user.lastName = existingUser.lastName;
          user.email = existingUser.email;
          user.role = "user";
          user.profilePicture = existingUser.profilePicture;
          user.accessToken = accessToken;
          user.kycVerified = existingUser.kycVerified;
          user.emailVerified = existingUser.emailVerified;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      return { ...token, ...user };
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        lastName: token.lastName as string,
        role: token.role as string,
        profilePicture: token.profilePicture as string | undefined,
        accessToken: token.accessToken as string | undefined,
      };

      return session;
    },
  },
};
