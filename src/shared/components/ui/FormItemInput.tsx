import { Input } from "@/shared/components/ui/input";
import React from "react";

interface FormItemInputProps {
  label: string;
  suffixIcon: React.ReactNode;
  options?: React.ReactNode;
}

const FormItemInput = ({ label, suffixIcon, options }: FormItemInputProps) => {
  return (
    <>
      <span>{label}</span>
      <Input
        type="text"
        placeholder="Enter your username"
        className="border border-gray-300 rounded-md p-2 mt-1"
        suffixIcon={suffixIcon}
      />
      {options}
    </>
  );
};

export default FormItemInput;
