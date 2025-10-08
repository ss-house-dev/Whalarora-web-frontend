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
      <div className="w-full max-w-[384px] rounded-[12px] border border-[#474747] bg-[#16171D] px-6 py-6 text-white shadow-[0_24px_56px_rgba(2,6,23,0.35)] md:max-w-[464px] md:px-8 md:py-8">
        <div className="flex flex-col space-y-6 md:space-y-8">
          <div className="space-y-6 md:space-y-8">
            <button
              type="button"
              onClick={onGoBack}
              aria-label="Go back"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#A4A4A4] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#225FED]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="20"
                viewBox="0 0 12 20"
                fill="none"
                className="h-5 w-3"
              >
                <path
                  d="M4.36308 9.99921L10.9292 16.6862C11.5238 17.2917 11.5239 18.2619 10.9296 18.8677C10.3193 19.4896 9.31748 19.4897 8.70706 18.868L0 9.99921L8.7078 1.13111C9.3179 0.509782 10.319 0.509781 10.9291 1.13111C11.5237 1.73662 11.5237 2.70678 10.9291 3.31228L4.36308 9.99921Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <div className="flex flex-col items-center space-y-4 md:space-y-6">
              <Image
                src="/assets/whalarora-logo.svg"
                alt="Logo"
                width={105}
                height={105}
                className="h-[84px] w-[84px] rounded-full object-cover md:h-[105px] md:w-[105px]"
              />
              <p className="text-[28px] font-bold leading-[40px] text-white md:text-[32px] md:leading-[40px]">
                Log in an account
              </p>
            </div>

            <div className="flex flex-col items-center space-y-5 md:space-y-6">
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
                      className="p-1 focus:outline-none disabled:opacity-50"
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

              {/* <div className="flex w-full items-center justify-between text-sm"> */}
              {/* <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={formData.rememberMe}
                    disabled={isLoading}
                    onCheckedChange={(checked) => onInputChange('rememberMe', checked as boolean)}
                    className="cursor-pointer border-gray-300 bg-white text-[#1F4293] data-[state=checked]:border-gray-300 data-[state=checked]:bg-white data-[state=checked]:text-[#1F4293] disabled:opacity-50"
                  />
                  <Label
                    htmlFor="remember-me"
                    className={`cursor-pointer text-sm font-medium leading-none text-white ${
                      isLoading ? 'opacity-50' : ''
                    }`}
                  >
                    Remember me
                  </Label>
                </div> */}
              {/* <button
                  type="button"
                  className={`text-sm font-medium text-[#B0B0B0] transition-colors hover:text-white ${
                    isLoading ? 'pointer-events-none opacity-50' : ''
                  }`}
                  onClick={onForgotPassword}
                >
                  Forgot password?
                </button> */}
              {/* </div> */}
            </div>

            <div className="flex w-full justify-center">
              {error && (
                <div className="flex w-full max-w-[320px] items-center rounded-[12px] border border-[#D84C4C] px-3 py-3 md:max-w-[400px]">
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
                    <p className="text-xs text-[#D84C4C]">{error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                variant="default"
                className="h-12 w-full max-w-[320px] cursor-pointer text-base bg-[#225FED] hover:bg-[#1e4fda] disabled:cursor-not-allowed disabled:opacity-50 md:h-[48px] md:max-w-[400px] md:text-[18px]"
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

          <div className="flex items-center justify-center text-sm text-[#B0B0B0] md:text-[14px]">
            <p className="mr-2">Don&apos;t have an account?</p>
            <button
              type="button"
              className={`text-base text-[#3A8AF7] transition-opacity hover:opacity-80 md:text-[16px] cursor-pointer ${
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
