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
  errorMessage?: string; // เพิ่ม prop นี้เพื่อรองรับ custom error message
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
  errorMessage, // รับ custom error message
}: FormItemInputProps) => {
  const isEmpty = value.trim() === ''; // Check if the input is empty

  // กำหนด error message ที่จะแสดง
  const displayErrorMessage = errorMessage || (isEmpty && hasError ? 'Required' : '');

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-[2px]">
        <span className="text-white text-[16px]">{label}</span>
        {displayErrorMessage && (
          <span className="text-[#D84C4C] text-[12px]">{displayErrorMessage}</span>
        )}
      </div>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          disabled={disabled}
          className={`rounded-md w-[400px] h-[44px] bg-[#1F2029] p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
            hasError ? 'border-[#D84C4C]' : 'focus:border-[#225FED]'
          } focus:outline-none ${
            type === 'password'
              ? '[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-password-toggle]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden'
              : ''
          }`}
        />
        {suffixIcon && (
          <div className="absolute right-3 top-0 h-full flex items-center">{suffixIcon}</div>
        )}
      </div>
      {options}
    </div>
  );
};

export default FormItemInput;
