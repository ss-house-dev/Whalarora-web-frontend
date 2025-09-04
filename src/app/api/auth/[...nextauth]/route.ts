import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    /**
     * Credentials provider for username/password authentication
     */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userName: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Authentication with axios
        try {
          const response = await axios.post(
            "http://141.11.156.52:3001/auth/login",
            {
              userName: credentials?.userName,
              password: credentials?.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 10000, // 10 second timeout
            }
          );

          const data = response.data;

          if (data.access_token) {
            return {
              id: data.user?.id || credentials?.userName,
              name: credentials?.userName,
              accessToken: data.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  /**
   * JWT callbacks
   */
  callbacks: {
    async jwt({ token, user }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
});

export { handler as GET, handler as POST };
