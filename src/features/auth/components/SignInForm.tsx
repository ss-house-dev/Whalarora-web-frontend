import React from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import FormInputIcon from '@/components/FormItemInput';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SignInData {
  username: string;
  password: string;
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

export const SignInForm: React.FC<SignInFormProps> = ({
  showPassword,
  formData,
  error,
  isLoading = false,
  onTogglePasswordVisibility,
  onInputChange,
  onSignIn,
  onForgotPassword,
  onSignUp,
  onGoBack,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onSignIn();
    }
  };

  const hasError = Boolean(error);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-[464px] h-[640px] rounded-xl bg-[#081125] px-8 py-5">
        <div className="flex flex-col space-y-4 text-white">
          <div className="space-y-6">
            {/* Back Button */}
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="20"
                viewBox="0 0 12 20"
                fill="none"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={onGoBack}
              >
                <path
                  d="M4.36308 9.99921L10.9292 16.6862C11.5238 17.2917 11.5239 18.2619 10.9296 18.8677C10.3193 19.4896 9.31748 19.4897 8.70706 18.868L0 9.99921L8.7078 1.13111C9.3179 0.509782 10.319 0.509781 10.9291 1.13111C11.5237 1.73662 11.5237 2.70678 10.9291 3.31228L4.36308 9.99921Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Logo and Text Create */}
            <div className="flex flex-col items-center">
              <Image
                src="/assets/whalarora-logo.svg"
                alt="Logo"
                width={105}
                height={105}
                className="w-[105px] h-[105px] rounded-full object-cover"
              />
              <p className="text-transparent bg-clip-text bg-gradient-to-b from-[#1F4293] to-[#43E9DD] text-[32px] font-bold">
                Log in an account
              </p>
            </div>

            <div className="flex flex-col justify-center items-center space-y-4">
              {/* Username */}
              <div className="flex flex-col">
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
              <div className="flex flex-col">
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
              </div>

              {/* Remember Me & Forgot password */}
              <div className="flex justify-between w-full">
                <div className="flex items-center justify-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={formData.rememberMe}
                    disabled={isLoading}
                    onCheckedChange={(checked) => onInputChange('rememberMe', checked as boolean)}
                    className="border-gray-300 bg-white data-[state=checked]:bg-white data-[state=checked]:text-[#1F4293] data-[state=checked]:border-gray-300 cursor-pointer disabled:opacity-50"
                  />
                  <Label
                    htmlFor="remember-me"
                    className={`cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
                  >
                    Remember me
                  </Label>
                </div>
                <div>
                  <p
                    className={`text-[14px] underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity ${
                      isLoading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                    onClick={onForgotPassword}
                  >
                    Forgot password ?
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="w-[400px] h-[48px] flex items-center justify-center">
              {error && (
                <div className="w-full h-full border border-[#D84C4C] rounded-[12px] flex items-center px-2 py-3">
                  {/* Error Icon */}
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
                  {/* Error Message */}
                  <div className="flex-1">
                    <p className="text-[#D84C4C] text-[12px]">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Button Login */}
            <div className="flex justify-center">
              <Button
                variant="gradient2"
                className="w-[400px] h-[48px] cursor-pointer text-[18px] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Log in'
                )}
              </Button>
            </div>

            <div className="text-[12px] font-[400px] flex items-center justify-center">
              <p className="mr-2">Don&apos;t have an account ?</p>
              <p
                className={`text-[#3A8AF7] text-[16px] cursor-pointer hover:opacity-80 transition-opacity ${
                  isLoading ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={onSignUp}
              >
                Sign up
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
