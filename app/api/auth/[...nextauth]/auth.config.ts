import { AuthMethod, PrismaClient } from "@prisma/client";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEFAULT_MAX_AGE = 45 * 60;
const REMEMBER_ME_MAX_AGE = 7 * 24 * 60 * 60;
// const DEFAULT_MAX_AGE = 1 * 60;
// const REMEMBER_ME_MAX_AGE = 2 * 60;

export const authConfig: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET_KEY!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        try {
          // Find user in DB
          console.log("credentials", credentials);
          const user = await prisma.user.findUnique({
            where: {
              email: credentials?.email,
              authMethod: AuthMethod.CREDENTIALS, // Ensures authentication method matches - prevents Google OAuth users from using password login
            },
          });
          if (!user) {
            throw new Error("No user found");
          }
          // Check password
          if (!credentials?.password) {
            throw new Error("Password is required");
          }
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password!
          );
          if (!isValid) {
            throw new Error("Password is incorrect");
          }

          // console.log("login done");
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: "USER",
            rememberMe: credentials.rememberMe === "true", // Convert checkbox value to boolean
          };
        } catch (error) {
          console.log("error", error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Something went wrong");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // console.log("signIn", user, account); // Debugging

      // Skip logic for Credentials login, as it's already handled in `authorize`
      if (account?.provider === "credentials") {
        return true; // Allow login immediately
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: user.email!,
          },
        });
        console.log("user exists info", dbUser);

        if (!dbUser) {
          // if user does not exist, create a new user and let signin
          const role = user.email === process.env.ADMIN_MAIL ? "ADMIN" : "USER";
          console.log(role);

          const createdUser = await prisma.user.create({
            data: {
              role: role,
              email: user.email!,
              name: user.name!,
              image: user.image ? user.image : "",
              authMethod: AuthMethod.GOOGLE,
            },
          });
          console.log("user created info", createdUser);
          user.role = createdUser.role;
          user.id = createdUser.id;
        } else {
          // Update user data if it has changed
          const updatedUser = await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.name!,
              image: user.image ? user.image : "",
            },
          });
          console.log("user updated info", updatedUser);
          // Use dbUser data for existing users
          user.role = dbUser.role;
          user.id = dbUser.id;
        }

        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      console.log("check user", user);
      if (user) {
        token.role = user.role; // Now user.role exists because we added it in `signIn`
        token.id = user.id;
        token.rememberMe = user.rememberMe ?? false;
        console.log("remeberme tokencheck", token.rememberMe); //?dev

        token.maxAge = user.rememberMe ? REMEMBER_ME_MAX_AGE : DEFAULT_MAX_AGE;
        // Math.floor(Date.now() / 1000) +
      }
      console.log("token", token); //?dev
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        console.log("token.role", token.role);
        session.user.role = token.role; // Attach role to session
        session.user.id = token.id;
        session.user.rememberMe = token.rememberMe;
        // session.expires = new Date(
        //   Date.now() +
        //     (token.rememberMe ? REMEMBER_ME_MAX_AGE : DEFAULT_MAX_AGE) * 1000
        // ).toISOString();
        // session.maxAge =  token.rememberMe ? REMEMBER_ME_MAX_AGE : DEFAULT_MAX_AGE
      }
      console.log("sessiondata", session); //?dev
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: DEFAULT_MAX_AGE, // Default 45 minutes
  },
  pages: {
    signIn: "/login", // Custom login page (optional)
  },
  secret: process.env.NEXTAUTH_SECRET,
};
