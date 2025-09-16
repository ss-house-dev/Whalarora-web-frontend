import React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FormInputIcon from '@/components/FormItemInput';
import { Button } from '@/components/button-sign-up';

// Zod validation schema
const signUpSchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, 'Password must contain at least one symbol')
      .regex(
        /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+$/,
        'Password must contain English characters only'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  isLoading?: boolean;
  onSignUp: (data: SignUpFormData) => void;
  onGoToSignIn?: () => void;
  onSignIn: () => void;
  onGoBack: () => void;
}

// Password strength requirements
const passwordRequirements = [
  { regex: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+$/, text: 'English only' },
  { regex: /[A-Z]/, text: 'At least one uppercase letter (A–Z)' },
  { regex: /[a-z]/, text: 'At least one lowercase letter (a–z)' },
  { regex: /\d/, text: 'At least one number (0–9)' },
  { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, text: 'At least one symbol' },
  { regex: /.{8,}/, text: 'At least 8 characters long' },
];

// Calculate password strength score and status
const checkPasswordStrength = (password: string) => {
  const strength = passwordRequirements.map((req) => ({
    met: req.regex.test(password),
    text: req.text,
  }));
  const score = strength.filter((req) => req.met).length;

  return { strength, score };
};

export const SignUpForm: React.FC<SignUpFormProps> = ({
  isLoading = false,
  onSignUp,
  onGoBack,
}) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');
  const confirmPasswordValue = watch('confirmPassword', '');
  const { strength, score } = checkPasswordStrength(passwordValue);

  // Check if password has requirements not met (when password is not empty but not all requirements are met)
  const hasPasswordRequirementsNotMet =
    passwordValue.length > 0 && score < passwordRequirements.length;

  const onSubmit = (data: SignUpFormData) => {
    onSignUp(data);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-[464px] h-[740px] rounded-[12px] bg-[#16171D] border border-[#474747] px-8 py-5">
        <form onSubmit={handleSubmit(onSubmit)}>
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
                    value={watch('username') || ''}
                    onChange={(e) => {
                      setValue('username', e.target.value);
                      if (errors.username) {
                        clearErrors('username');
                      }
                    }}
                    disabled={isLoading}
                    hasError={!!errors.username}
                    suffixIcon={
                      <Image
                        src="/assets/username.svg"
                        alt="Username Icon"
                        width={6}
                        height={6}
                        className="h-6 w-6 text-gray-400 p-1"
                      />
                    }
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col w-full">
                  <FormInputIcon
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordValue}
                    onChange={(e) => {
                      setValue('password', e.target.value);
                      if (errors.password) {
                        clearErrors('password');
                      }
                    }}
                    disabled={isLoading}
                    hasError={!!errors.password || hasPasswordRequirementsNotMet}
                    errorMessage={
                      hasPasswordRequirementsNotMet ? 'Password requirements not met' : undefined
                    }
                    suffixIcon={
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                        className="focus:outline-none disabled:opacity-50 p-1"
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
                  <div className="mt-[16px]">
                    <ul className="mt-1 space-y-1" aria-label="Password requirements">
                      {strength.map((req, index) => (
                        <li
                          key={index}
                          className={`flex items-center gap-1 text-xs ${
                            req.met ? 'text-[#2FACA2]' : 'text-[#797979]'
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center shrink-0">
                            {req.met ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M6 12C9.3138 12 12 9.3138 12 6C2.6862 0 0 2.6862 0 6C0 9.3138 2.6862 12 6 12ZM9.2742 4.4742L5.4 8.3484L2.8758 5.8242L3.7242 4.9758L5.4 6.6516L8.4258 3.6258L9.2742 4.4742Z"
                                  fill="#2FACA2"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="4"
                                height="4"
                                viewBox="0 0 4 4"
                                fill="none"
                              >
                                <circle cx="2" cy="2" r="2" fill="#797979" />
                              </svg>
                            )}
                          </div>
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPasswordValue}
                    onChange={(e) => {
                      setValue('confirmPassword', e.target.value);
                      if (errors.confirmPassword) {
                        clearErrors('confirmPassword');
                      }
                    }}
                    disabled={isLoading}
                    hasError={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword?.message}
                    suffixIcon={
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        disabled={isLoading}
                        className="focus:outline-none disabled:opacity-50 p-1"
                      ></button>
                    }
                  />
                </div>
              </div>

              {/* Error Message */}
              <div className="w-[400px] h-[26px] mb-0 flex items-center justify-center"></div>

              {/* Button Sign Up */}
              <div className="flex justify-center mb-2">
                <Button
                  type="submit"
                  className="w-[400px] h-[48px] cursor-pointer text-[18px] disabled:opacity-50 disabled:cursor-not-allowed bg-[#225FED]"
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

              <div className="text-[12px] font-[400px] flex items-center justify-center mt-[24px]">
                <p className="mr-2">Already have an account?</p>
                <p
                  className={`text-[#3A8AF7] text-[16px] cursor-pointer hover:opacity-80 transition-opacity ${
                    isLoading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  onClick={() => router.push('/auth/sign-in')}
                >
                  Log in
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
