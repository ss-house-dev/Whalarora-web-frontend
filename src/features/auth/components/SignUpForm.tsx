import React from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import FormInputIcon from '@/components/ui/FormItemInput';
import { Button } from '@/components/button-sign-up';

interface SignInData {
  username: string;
  password: string;
  confirmPassword: string; // Added confirmPassword field
  rememberMe: boolean;
}

interface SignInFormProps {
  showPassword: boolean;
  formData: SignInData;
  error: string;
  isLoading?: boolean;
  onTogglePasswordVisibility: () => void;
  onInputChange: (field: keyof SignInData, value: string | boolean) => void;
  onSignIn: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onGoBack: () => void;
}

// Password strength requirements
const passwordRequirements = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /\d/, text: 'At least 1 number' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
];

// Calculate password strength score and status
const checkPasswordStrength = (password: string) => {
  const strength = passwordRequirements.map((req) => ({
    met: req.regex.test(password),
    text: req.text,
  }));
  const score = strength.filter((req) => req.met).length;
  let color: string;
  let text: string;

  if (score === 0) {
    color = 'bg-gray-500';
    text = 'Enter a password';
  } else if (score <= 2) {
    color = 'bg-red-500';
    text = 'Weak password';
  } else if (score === 3) {
    color = 'bg-yellow-500';
    text = 'Medium password';
  } else {
    color = 'bg-green-500';
    text = 'Strong password';
  }

  return { strength, score, color, text };
};

export const SignUpForm: React.FC<SignInFormProps> = ({
  showPassword,
  formData,
  error,
  isLoading = false,
  onTogglePasswordVisibility,
  onInputChange,
  onSignIn,
  onSignUp,
  onGoBack,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onSignIn();
    }
  };

  const hasError = Boolean(error);
  const { strength } = checkPasswordStrength(formData.password);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-[464px] h-[720px] rounded-[12px] bg-[#16171D] border border-[#474747] px-8 py-5">
        <div className="flex flex-col space-y-4 text-white">
          <div className="space-y-4">
            {/* Back Button */}
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="20"
                viewBox="0 0 12 20"
                fill="none"
                onClick={onGoBack}
                className="cursor-pointer"
              >
                <path
                  d="M4.36308 9.99921L10.9292 16.6862C11.5238 17.2917 11.5239 18.2619 10.9296 18.8677C10.3193 19.4896 9.31748 19.4897 8.70706 18.868L0 9.99921L8.7078 1.13111C9.3179 0.509782 10.319 0.509781 10.9291 1.13111C11.5237 1.73662 11.5237 2.70678 10.9291 3.31228L4.36308 9.99921Z"
                  fill="#A4A4A4"
                />
              </svg>
            </div>

            {/* Logo and Text Create */}
            <div className="flex flex-col items-center">
              <Image src="/assets/whalarora-logo.svg" alt="Logo" width={130} height={110} />
              <p className="text-transparent bg-clip-text bg-white from-[#1F4293] to-[#43E9DD] text-[32px] font-bold">
                Create an account
              </p>
            </div>

            <div className="flex flex-col justify-center items-center space-y-4 mb-0">
              {/* Username */}
              <div className="flex flex-col w-full">
                <FormInputIcon
                  label="Username"
                  value={formData.username}
                  onChange={(e) => onInputChange('username', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  hasError={hasError}
                  suffixIcon={
                    <Image
                      src="/assets/username.svg"
                      alt="Username Icon"
                      width={6}
                      height={6}
                      className="h-6 w-6 text-gray-400"
                    />
                  }
                />
              </div>

              {/* Password */}
              <div className="flex flex-col w-full">
                <FormInputIcon
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => onInputChange('password', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  hasError={hasError}
                  suffixIcon={
                    <button
                      type="button"
                      onClick={onTogglePasswordVisibility}
                      disabled={isLoading}
                      className="focus:outline-none disabled:opacity-50"
                    >
                      {showPassword ? (
                        <Eye className="h-6 w-6 text-gray-400 cursor-pointer" />
                      ) : (
                        <EyeOff className="h-6 w-6 text-gray-400 cursor-pointer" />
                      )}
                    </button>
                  }
                />
                {/* Password Strength Indicator */}
                <div className="mt-2">
                  <ul className="mt-1 space-y-1" aria-label="Password requirements">
                    {strength.map((req, index) => (
                      <li
                        key={index}
                        className={`flex items-center gap-1 text-xs ${
                          req.met ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="shrink-0"
                        >
                          {req.met ? (
                            <path d="M20 6L9 17l-5-5" />
                          ) : (
                            <path d="M18 6l-12 12M6 6l12 12" />
                          )}
                        </svg>
                        <span>{req.text}</span>
                        <span className="sr-only">
                          {req.met ? ' - Requirement met' : ' - Requirement not met'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col w-full">
                <FormInputIcon
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => onInputChange('confirmPassword', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  hasError={hasError}
                  suffixIcon={
                    <button
                      type="button"
                      onClick={onTogglePasswordVisibility}
                      disabled={isLoading}
                      className="focus:outline-none disabled:opacity-50"
                    >
                      {showPassword ? (
                        <Eye className="h-6 w-6 text-gray-400 cursor-pointer" />
                      ) : (
                        <EyeOff className="h-6 w-6 text-gray-400 cursor-pointer" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Error Message */}
            <div className="w-[400px] h-[48px] flex items-center justify-center mb-[10px]">
              {error && (
                <div className="w-full h-full border border-[#D84C4C] rounded-[12px] flex items-center px-2 py-3">
                  <div className="flex-shrink-0 mr-2 mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 24C5.3724 24 0 18.6276 0 12C0 5.3724 5.3724 0 12 0C18.6276 0 24 5.3724 24 12C24 18.6276 18.6276 24 12 24ZM10.8 15.6V18H13.2V15.6H10.8ZM10.8 6V13.2H13.2V6H10.8Z"
                        fill="#D84C4C"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#D84C4C] text-[12px]">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Button Sign Up */}
            <div className="flex justify-center">
              <Button
                className="w-[400px] h-[48px] cursor-pointer text-[18px] disabled:opacity-50 disabled:cursor-not-allowed bg-[#225FED]"
                onClick={onSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  'Create an account'
                )}
              </Button>
            </div>

            <div className="text-[12px] font-[400px] flex items-center justify-center">
              <p className="mr-2">Already have an account?</p>
              <p
                className={`text-[#3A8AF7] text-[16px] cursor-pointer hover:opacity-80 transition-opacity ${
                  isLoading ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={onSignUp}
              >
                Log in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
