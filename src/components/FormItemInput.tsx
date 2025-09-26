import { Input } from '@/components/ui/input';
import React from 'react';

interface FormItemInputProps {
  label: string;
  suffixIcon: React.ReactNode;
  options?: React.ReactNode;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string; // expose custom error message support
}

const FormItemInput = ({
  label,
  suffixIcon,
  options,
  type = 'text',
  value = '',
  onChange,
  onKeyPress,
  disabled = false,
  hasError = false,
  errorMessage, // allow overriding the default error copy
}: FormItemInputProps) => {
  const isEmpty = value.trim() === ''; // Check if the input is empty

  // decide which error message to surface
  const displayErrorMessage = errorMessage || (isEmpty && hasError ? 'Required.' : '');

  return (
    <div className="relative w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium leading-tight text-white md:text-[16px]">{label}</span>
        {displayErrorMessage && (
          <span className="text-[12px] text-[#D84C4C]">{displayErrorMessage}</span>
        )}
      </div>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          disabled={disabled}
          className={`h-12 w-full rounded-[12px] border border-transparent bg-[#1F2029] p-3 text-white placeholder:text-[#787878] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none md:h-[44px] md:w-[400px] md:rounded-[8px] ${
            hasError ? 'border-[#D84C4C] focus:border-[#D84C4C]' : 'focus:border-[#225FED]'
          } ${
            type === 'password'
              ? '[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-password-toggle]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden'
              : ''
          }`}
        />
        {suffixIcon && (
          <div className="absolute right-3 top-0 flex h-full items-center">{suffixIcon}</div>
        )}
      </div>
      {options}
    </div>
  );
};

export default FormItemInput;
