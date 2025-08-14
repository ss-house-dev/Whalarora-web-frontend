"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, User, ChevronLeft } from "lucide-react";
import FormInputIcon from "@/app/components/ui/FormItemInput";
import { Button } from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const Router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  
  return (
    <div className="flex items-center justify-center min-h-screen p-20">
      <div className="w-[520px] rounded-xl bg-[#081125] p-16">
        <div className="flex flex-col space-y-4 text-white">
          {/* Back Button */}
          <div>
            <ChevronLeft
              onClick={() => Router.push("/main/trading")}
              className="h-7 w-7 text-gray-400 cursor-pointer"
            />
          </div>
          {/* Logo and Text Create */}
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="w-[80px] h-[80px] rounded-full object-cover"
            />
            <p className="text-lg font-bold">Sign in an account</p>
          </div>
          {/* Username */}
          <div className="flex flex-col">
            <FormInputIcon
              label="Username"
              placeholder="Enter your username"
              suffixIcon={<User className="h-4 w-4 text-gray-400" />}
            />
          </div>
          {/* Password */}
          <div className="flex flex-col">
            <FormInputIcon
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              suffixIcon={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              }
            />
          </div>
          {/* Button Confirm */}
          <div className="flex justify-center">
            <Button variant="gradient" className="w-[100%] cursor-pointer">
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
