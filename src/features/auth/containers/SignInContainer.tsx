"use client";
import React, { useState } from "react";
import { SignInForm } from "@/features/auth/components/SignInForm";

interface SignInData {
  username: string;
  password: string;
  rememberMe: boolean;
}

const SignInContainer = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignInData>({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState<string>("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (field: keyof SignInData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignIn = async () => {
    try {
      setError("");
      // Validate form
      if (!formData.username || !formData.password) {
        setError("Please fill in all required fields");
        return;
      }

      // Add your sign-in logic here
      console.log("Signing in with:", formData);
      
      // Example API call:
      // const response = await signInAPI(formData);
      // if (response.success) {
      //   // Handle success (redirect, store token, etc.)
      // }
    } catch (err) {
      setError("Sign in failed. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    // Add forgot password logic
    console.log("Forgot password clicked");
  };

  const handleSignUp = () => {
    // Add navigation to sign up page
    console.log("Sign up clicked");
  };

  const handleGoBack = () => {
    // Add navigation back logic
    console.log("Go back clicked");
  };

  return (
    <SignInForm
      showPassword={showPassword}
      formData={formData}
      error={error}
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