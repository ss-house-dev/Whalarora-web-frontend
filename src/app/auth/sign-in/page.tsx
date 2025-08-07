import React from "react";
import Image from "next/image";
import { Eye, User } from "lucide-react";
import FormInputIcon from "@/shared/components/ui/FormItemInput";
import { Button } from "@/shared/components/ui/Button";

const SignInPage = () => {
  return (
    <div className="flex item-center justify-center min-h-screen p-20">
      <div className="w-[520px] rounded-xl bg-[#081125] p-16">
        <div className="flex flex-col space-y-4 text-white">
          {/* Logo and Text Create */}
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
            <p>Sign in an account</p>
          </div>
          {/* End Logo and Text Create */}

          {/* Username */}
          <div className="flex flex-col">
             <FormInputIcon
              label="Username"
              suffixIcon={<User className="h-4 w-4 text-gray-400" />}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <FormInputIcon
              label="Password"
              suffixIcon={<Eye className="h-4 w-4 text-gray-400" />}
            />
          </div>

          {/* Button Confirm */}
          <div className="flex justify-center">
            <Button variant="default" className="w-[70%]">
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
