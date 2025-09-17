'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SignUpForm } from '@/features/auth/components/SignUpForm';
import axios from 'axios';

interface SignUpFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

const SignUpContainer = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>(''); // Add username-specific error

  /**
   * Handles the sign-up process
   * 1. Create user via API
   * 2. Automatically sign in the user
   * 3. Redirect to Welcome page first
   */
  const handleSignUp = async (formData: SignUpFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(''); // Reset error message
      setUsernameError(''); // Reset username error

      // Step 1: Create user account via Next.js API route
      const createUserResponse = await axios.post(
        '/api/auth/signup',
        {
          username: formData.username.trim(), // Remove whitespace
          password: formData.password,
          fName: formData.username.trim(),
          lName: 'User', // Default value instead of empty string
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // Increase timeout to 30 seconds
        }
      );

      console.log('User created successfully:', createUserResponse.data);

      // Step 2: Automatically sign in the newly created user
      const signInResult = await signIn('credentials', {
        userName: formData.username.trim(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error('Sign in error after signup:', signInResult.error);
        setErrorMessage(
          'Account created successfully but failed to sign in. Please sign in manually.'
        );
        // Redirect user to sign in page
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 2000);
      } else if (signInResult?.ok) {
        console.log('Sign in successful, redirecting to welcome page...');
        // Step 3: Redirect to Welcome page first (instead of directly to trading)
        router.push('/welcome');
      } else {
        setErrorMessage('Sign in failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);

      let generalErrorMessage = 'Registration failed. Please try again.';
      let specificUsernameError = '';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          console.error('Error response data:', data);

          // Check for username already exists error
          const errorMessage = data?.message || data?.error || '';
          const usernameConflictKeywords = [
            'username is already in use',
            'username already exists',
            'username already taken',
            'Already exist.',
          ];

          const isUsernameConflict = usernameConflictKeywords.some((keyword) =>
            errorMessage.toLowerCase().includes(keyword.toLowerCase())
          );

          if (status === 409 || isUsernameConflict) {
            // Username conflict - show error at username field
            specificUsernameError = 'Already exist.';
            generalErrorMessage = ''; // Don't show general error
          } else {
            // Other errors - show general error message
            switch (status) {
              case 400:
                // Handle other validation errors
                if (data?.error && Array.isArray(data.error)) {
                  generalErrorMessage = `Invalid data: ${data.error.join(', ')}`;
                } else if (data?.details?.error && Array.isArray(data.details.error)) {
                  generalErrorMessage = `Invalid data: ${data.details.error.join(', ')}`;
                } else if (data?.error && !isUsernameConflict) {
                  generalErrorMessage = data.error;
                } else if (data?.message && !isUsernameConflict) {
                  generalErrorMessage = data.message;
                } else if (!isUsernameConflict) {
                  generalErrorMessage = 'Invalid data. Please check your input and try again.';
                }
                break;

              case 422:
                generalErrorMessage =
                  'Invalid or incomplete data. Please check your input and try again.';
                break;

              case 500:
                generalErrorMessage = 'Server error occurred. Please try again later.';
                break;

              case 503:
                generalErrorMessage = 'Cannot connect to server. Please try again later.';
                break;

              default:
                if (data?.error && !isUsernameConflict) {
                  generalErrorMessage = data.error;
                } else if (data?.message && !isUsernameConflict) {
                  generalErrorMessage = data.message;
                }
            }
          }
        } else if (error.request) {
          // Network error
          generalErrorMessage = 'Cannot connect to server. Please check your internet connection.';
        }
      } else if (error.message) {
        generalErrorMessage = error.message;
      }

      setUsernameError(specificUsernameError);
      setErrorMessage(generalErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToSignIn = () => {
    router.push('/auth/sign-in');
  };

  return (
    <div>
      <SignUpForm
        isLoading={isLoading}
        onSignUp={handleSignUp}
        onGoBack={handleGoBack}
        onSignIn={handleGoToSignIn}
        usernameError={usernameError} // Pass username error to form
        onUsernameChange={() => {
          // Clear username error when user starts typing
          if (usernameError) {
            setUsernameError('');
          }
        }}
      />

      {/* Display General Error Message */}
      {errorMessage && (
        <div className="fixed top-4 right-4 max-w-md bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-start">
            <div className="pr-2">
              <p className="text-sm font-medium">Error</p>
              <p className="text-sm mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-white hover:text-gray-200 ml-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpContainer;
