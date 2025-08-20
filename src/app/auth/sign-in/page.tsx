import { Metadata } from "next";
import SignInContainer from "@/features/auth/containers/SignInContainer";

export const metadata: Metadata = {
  title: "Sign In - Whalarora",
  description: "Sign in to your Whalarora account",
};

export default function SignInPage() {
  return <SignInContainer />;
}