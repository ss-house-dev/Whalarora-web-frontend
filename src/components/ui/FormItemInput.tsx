import { Input } from "@/components/ui/input";
import React from "react";

interface FormItemInputProps {
  label: string;
  suffixIcon: React.ReactNode;
  options?: React.ReactNode;
  type?: string;
}

const FormItemInput = ({
  label,
  suffixIcon,
  options,
  type = "text",
}: FormItemInputProps) => {
  return (
    <>
      <span className="text-white mb-[2px] text-[16px] block">{label}</span>
      <div className="relative">
        <Input
          type={type}
          className={`rounded-md w-[400px] h-[44px] bg-[#17306B] p-3 ${
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
