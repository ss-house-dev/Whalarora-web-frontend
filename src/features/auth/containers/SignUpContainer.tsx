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

  /**
   * Handles the sign-up process
   * 1. Create user via API
   * 2. Automatically sign in the user
   * 3. Redirect to main page
   */
  const handleSignUp = async (formData: SignUpFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(''); // รีเซ็ต error message

      // Step 1: Create user account via Next.js API route
      const createUserResponse = await axios.post(
        '/api/auth/signup',
        {
          username: formData.username.trim(), // ลบช่องว่าง
          password: formData.password,
          fName: formData.username.trim(),
          lName: 'User', // ใส่ default value แทน empty string
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // เพิ่ม timeout เป็น 30 วินาที
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
        setErrorMessage('สร้างบัญชีสำเร็จแต่เข้าสู่ระบบไม่ได้ กรุณาเข้าสู่ระบบด้วยตนเอง');
        // ให้ผู้ใช้ไปหน้า sign in
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 2000);
      } else if (signInResult?.ok) {
        console.log('Sign in successful, redirecting...');
        // Step 3: Redirect to main page
        window.location.href = '/main/trading';
      } else {
        setErrorMessage('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);

      let errorMessage = 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          console.error('Error response data:', data);

          switch (status) {
            case 400:
              // จัดการ validation errors
              if (data?.error && Array.isArray(data.error)) {
                errorMessage = `ข้อมูลไม่ถูกต้อง: ${data.error.join(', ')}`;
              } else if (data?.details?.error && Array.isArray(data.details.error)) {
                errorMessage = `ข้อมูลไม่ถูกต้อง: ${data.details.error.join(', ')}`;
              } else if (data?.error) {
                errorMessage = data.error;
              } else if (data?.message) {
                errorMessage = data.message;
              } else {
                errorMessage = 'ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
              }
              break;

            case 409:
              errorMessage = 'ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่อผู้ใช้อื่น';
              break;

            case 422:
              errorMessage = 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
              break;

            case 500:
              errorMessage = 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่ในภายหลัง';
              break;

            case 503:
              errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่ในภายหลัง';
              break;

            default:
              if (data?.error) {
                errorMessage = data.error;
              } else if (data?.message) {
                errorMessage = data.message;
              }
          }
        } else if (error.request) {
          // Network error
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrorMessage(errorMessage);
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
      />

      {/* แสดง Error Message */}
      {errorMessage && (
        <div className="fixed top-4 right-4 max-w-md bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-start">
            <div className="pr-2">
              <p className="text-sm font-medium">เกิดข้อผิดพลาด</p>
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
