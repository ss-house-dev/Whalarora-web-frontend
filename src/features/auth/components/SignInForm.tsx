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
    <div className="flex min-h-screen items-center justify-center px-4 py-6 md:px-0 md:py-0">
      <div className="w-full max-w-[384px] rounded-xl bg-[#16171D] px-6 py-6 text-white outline outline-1 outline-[#474747] md:h-[640px] md:w-[464px] md:max-w-none md:bg-[#081125] md:px-8 md:py-5 md:outline-none">
        <div className="flex h-full flex-col">
          <div className="space-y-6">
            {/* Back Button */}
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="20"
                viewBox="0 0 12 20"
                fill="none"
                className="h-5 w-3 cursor-pointer text-white transition-opacity hover:opacity-80"
                onClick={onGoBack}
              >
                <path
                  d="M4.36308 9.99921L10.9292 16.6862C11.5238 17.2917 11.5239 18.2619 10.9296 18.8677C10.3193 19.4896 9.31748 19.4897 8.70706 18.868L0 9.99921L8.7078 1.13111C9.3179 0.509782 10.319 0.509781 10.9291 1.13111C11.5237 1.73662 11.5237 2.70678 10.9291 3.31228L4.36308 9.99921Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Logo and Heading */}
            <div className="flex flex-col items-center space-y-4 md:space-y-6">
              <Image
                src="/assets/whalarora-logo.svg"
                alt="Logo"
                width={105}
                height={105}
                className="h-[84px] w-[84px] rounded-full object-cover md:h-[105px] md:w-[105px]"
              />
              <p className="text-3xl font-semibold leading-10 text-white md:bg-clip-text md:text-[32px] md:font-bold md:text-transparent md:leading-10 md:bg-gradient-to-b md:from-[#1F4293] md:to-[#43E9DD]">
                Log in an account
              </p>
            </div>

            <div className="flex flex-col items-center space-y-5 md:space-y-4">
              {/* Username */}
              <div className="w-full">
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
              <div className="w-full">
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
                        <Eye className="h-6 w-6 cursor-pointer text-gray-400" />
                      ) : (
                        <EyeOff className="h-6 w-6 cursor-pointer text-gray-400" />
                      )}
                    </button>
                  }
                />
              </div>

              {/* Remember Me & Forgot password */}
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={formData.rememberMe}
                    disabled={isLoading}
                    onCheckedChange={(checked) => onInputChange('rememberMe', checked as boolean)}
                    className="cursor-pointer border-gray-300 bg-white text-[#1F4293] data-[state=checked]:border-gray-300 data-[state=checked]:bg-white data-[state=checked]:text-[#1F4293] disabled:opacity-50"
                  />
                  <Label
                    htmlFor="remember-me"
                    className={`cursor-pointer text-xs font-normal leading-none text-white md:text-base md:leading-tight md:font-medium ${
                      isLoading ? 'opacity-50' : ''
                    }`}
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className={`text-sm font-medium text-[#7C7C7E] transition-opacity hover:opacity-80 md:text-[14px] md:text-white md:underline md:underline-offset-2 ${
                    isLoading ? 'pointer-events-none opacity-50' : ''
                  }`}
                  onClick={onForgotPassword}
                >
                  Forgot password ?
                </button>
              </div>
            </div>

            {/* Error Message */}
            <div className="flex w-full justify-center">
              {error && (
                <div className="flex w-full max-w-[320px] items-center rounded-[12px] border border-[#D84C4C] px-3 py-3 md:max-w-none md:w-[400px]">
                  <div className="mr-2 flex-shrink-0">
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
                    <p className="text-[12px] text-[#D84C4C]">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Button Login */}
            <div className="flex justify-center">
              {/* Mobile (< md): พื้นสี #225FED */}
              <Button
                variant="default"
                className="md:hidden h-12 w-full cursor-pointer text-base disabled:cursor-not-allowed disabled:opacity-50 bg-[#225FED] hover:bg-[#1e4fda]"
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

              {/* Desktop (≥ md): gradient2 */}
              <Button
                variant="gradient2"
                className="hidden md:inline-flex md:h-[48px] md:w-[400px] md:text-[18px] h-12 w-full cursor-pointer text-base disabled:cursor-not-allowed disabled:opacity-50"
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
          </div>

          <div className="mt-8 flex items-center justify-center text-xs text-white md:mt-4 md:text-[12px]">
            <p className="mr-2">Don&apos;t have an account ?</p>
            <button
              type="button"
              className={`text-base text-[#3A8AF7] transition-opacity hover:opacity-80 md:text-[16px] ${
                isLoading ? 'pointer-events-none opacity-50' : ''
              }`}
              onClick={onSignUp}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
