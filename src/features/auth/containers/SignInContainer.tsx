"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SignInForm } from "@/features/auth/components/SignInForm";

interface SignInData {
  username: string;
  password: string;
  rememberMe: boolean;
}

const SignInContainer = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignInData>({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Toggles the visibility of the password field
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handles input changes for the sign-in form
   * @param field - The field being updated
   * @param value - The new value for the field
   */ 
  const handleInputChange = (
    field: keyof SignInData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  /**
   * Handles the sign-in process
   */
  const handleSignIn = async () => {
    try {
      setError("");
      setIsLoading(true);

      // Validate form
      if (!formData.username || !formData.password) {
        setError("Please fill in all required fields");
        return;
      }

      // Use NextAuth signIn function
      const result = await signIn("credentials", {
        userName: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password. Please try again.");
      } else if (result?.ok) {
        window.location.href = "/main/trading";
      }
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/auth/sign-up");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SignInForm
      showPassword={showPassword}
      formData={formData}
      error={error}
      isLoading={isLoading}
      onTogglePasswordVisibility={togglePasswordVisibility}
      onInputChange={handleInputChange}
      onSignIn={handleSignIn}
      onForgotPassword={handleForgotPassword}
      onSignUp={handleSignUp}
      onGoBack={handleGoBack}
    />
  );
};

export default SignInContainer;
