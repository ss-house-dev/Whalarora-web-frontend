'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

interface SignInData {
  username: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
}

const SignUpContainer = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignInData>({
    username: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Toggles the visibility of the password field
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handles input changes for the sign-up form
   * @param field - The field being updated
   * @param value - The new value for the field
   */
  const handleInputChange = (field: keyof SignInData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  /**
   * Handles the sign-up process
   */
  const handleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);

      // Validate form
      if (!formData.username || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Use NextAuth signIn function
      const result = await signIn('credentials', {
        userName: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password. Please try again.');
      } else if (result?.ok) {
        window.location.href = '/main/trading';
      }
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/auth/sign-in');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SignUpForm
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

export default SignUpContainer;
