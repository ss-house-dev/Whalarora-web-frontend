import { Input } from "@/components/ui/input";
import React from "react";

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
}

const FormItemInput = ({
  label,
  suffixIcon,
  options,
  type = "text",
  value,
  onChange,
  onKeyPress,
  disabled = false,
  placeholder,
  hasError = false,
}: FormItemInputProps) => {
  return (
    <>
      <span className="text-white mb-[2px] text-[16px] block">{label}</span>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          disabled={disabled}
          className={`rounded-md w-[400px] h-[44px] bg-[#17306B] p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
            hasError
              ? "border-[#D84C4C]"
              : "focus:border-[#3A8AF7]"
          } focus:outline-none ${
            type === "password"
              ? "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-password-toggle]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
              : ""
          }`}
        />
        {suffixIcon && (
          <div className="absolute right-3 top-0 h-full flex items-center">
            {suffixIcon}
          </div>
        )}
      </div>
      {options}
    </>
  );
};

export default FormItemInput;