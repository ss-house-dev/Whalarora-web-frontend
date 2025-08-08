import { Input } from "@/shared/components/ui/input";
import React from "react";

interface FormItemInputProps {
  label: string;
  placeholder: string;
  suffixIcon: React.ReactNode;
  options?: React.ReactNode;
  type?: string;
}

const FormItemInput = ({
  label,
  placeholder,
  suffixIcon,
  options,
  type = "text",
}: FormItemInputProps) => {
  return (
    <>
      <span className="text-white text-sm mb-1 block">{label}</span>
      <div className="relative">
        <Input
          type={type}
          placeholder={placeholder}
          className={`w-full border border-gray-300 rounded-md p-2 pr-10 ${
            type === "password"
              ? "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-password-toggle]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
              : ""
          }`}
        />
        {suffixIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {suffixIcon}
          </div>
        )}
      </div>
      {options}
    </>
  );
};

export default FormItemInput;
