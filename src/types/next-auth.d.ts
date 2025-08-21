import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    name?: string;
    accessToken?: string; // 👈 เพิ่มตรงนี้
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
export default NextAuth;