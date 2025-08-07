"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, CheckCircle, XCircle } from "lucide-react";

export const ConfirmPasswordInput = () => {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, formState: { errors }, watch } = useFormContext();
  
  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const isPasswordMatch = password && confirmPassword && password === confirmPassword;
  const hasConfirmPasswordError = confirmPassword && password !== confirmPassword;

  return (
    <div className="mb-6">
      <label htmlFor="confirmPassword" className="block text-sm font-light mb-1">
        Confirm Password
      </label>

      <div className="relative">
        <input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: {
              matchPassword: (value) => 
                value === password || "Passwords do not match",
            },
          })}
          className={`w-full border rounded px-4 py-2 pr-10 bg-transparent text-white [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${
            errors.confirmPassword || hasConfirmPasswordError
              ? "border-red-500"
              : isPasswordMatch
              ? "border-green-500"
              : "border-white"
          }`}
          placeholder="Confirm your password"
        />
        
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          {isPasswordMatch && (
            <CheckCircle className="text-green-500 w-5 h-5" />
          )}
          {(errors.confirmPassword || hasConfirmPasswordError) && (
            <XCircle className="text-red-500 w-5 h-5" />
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowConfirmPassword((s) => !s)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white z-10"
          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
        >
          <Eye size={18} />
        </button>
      </div>

      {/* Error Message */}
      {errors.confirmPassword?.message && (
        <p className="text-red-500 text-sm mt-1">
          {errors.confirmPassword.message as string}
        </p>
      )}

      {/* Success Message */}
      {isPasswordMatch && (
        <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
          <CheckCircle size={14} />
          Passwords match
        </p>
      )}
    </div>
  );
};