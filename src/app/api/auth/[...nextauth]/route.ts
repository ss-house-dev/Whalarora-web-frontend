import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userName: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const useMock = process.env.USE_MOCK_AUTH === "true";

        if (useMock) {
          // ใช้ mock user
          if (
            credentials?.userName === "testuser" &&
            credentials?.password === "testpass"
          ) {
            return {
              id: "mock-id",
              name: "testuser",
              accessToken: "mocked-access-token",
            };
          }
          return null;
        }

        // ของจริง
        try {
          const res = await fetch("http://whalarora.ddns.net:3001/auth/login", {
            method: "POST",
            body: JSON.stringify({
              userName: credentials?.userName,
              password: credentials?.password,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) return null;

          const response = await res.json();

          if (response.access_token) {
            return {
              id: response.user?.id || credentials?.userName,
              name: credentials?.userName,
              accessToken: response.access_token,
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
