"use client";

import { useForm, FormProvider } from "react-hook-form";
import { PasswordInput } from "@/features/auth/component/password-input";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { ConfirmPasswordInput } from "@/features/auth/component/comfirm-password";

const existingUsernames = ["john123", "admin", "test001"];

export default function SignupForm() {
  const methods = useForm();
  const {
    register,
    watch,
    formState: { errors },
  } = methods;

  const username = watch("username");
  const [isValid, setIsValid] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    if (!username) {
      setIsValid(false);
      return;
    }

    const regex = /^[A-Za-z0-9]+$/;
    const valid = regex.test(username);
    const duplicate = existingUsernames.includes(username.toLowerCase());

    setIsValid(valid && !duplicate);
    setIsDuplicate(duplicate);
  }, [username]);

  const onSubmit = (data: any) => {
    console.log("Form Data", data);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#0e101c]">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="w-full max-w-md p-6 text-white bg-[#0e101c]"
        >
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-24 h-24 object-cover rounded-full"
            />
          </div>
          <h1 className="text-2xl text-center pb-4 mb-1">
            Create an account
          </h1>

          {/* Username Field */}
          <label htmlFor="username" className="block mb-1 text-sm">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              {...register("username", {
                required: "Username is required",
                pattern: {
                  value: /^[A-Za-z0-9]+$/,
                  message: "Username must contain only letters and numbers",
                },
              })}
              className={`w-full border rounded px-4 py-2 bg-transparent text-white ${
                errors.username || isDuplicate
                  ? "border-red-500"
                  : "border-white"
              }`}
              // placeholder="Enter username"
            />
            <div className="absolute right-2 top-2.5">
              {username && isValid && !isDuplicate && (
                <CheckCircle className="text-green-500 w-5 h-5" />
              )}
              {username && (errors.username || isDuplicate) && (
                <XCircle className="text-red-500 w-5 h-5" />
              )}
            </div>
          </div>

          {/* Error or Duplicate Message */}
          {(errors.username?.message || isDuplicate) && (
            <p className="text-red-500 text-sm mb-2 mt-1">
              {typeof errors.username?.message === "string"
                ? errors.username.message
                : isDuplicate
                ? "Username already taken"
                : null}
            </p>
          )}

          {/* Password Field */}
          <PasswordInput />
          <ConfirmPasswordInput />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-700 text-white py-3 rounded uppercase tracking-widest text-sm mt-1"
          >
            Sign Up
          </button>
        </form>
      </FormProvider>
    </div>
  );
}