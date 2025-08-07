"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, CheckCircle, XCircle } from "lucide-react";

export const PasswordInput = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, formState: { errors }, watch } = useFormContext();
  const password = watch("password", "");

  const requirements = [
    { regex: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, text: "English only" },
    { regex: /[A-Z]/, text: "At least one uppercase letter (A–Z)" },
    { regex: /[a-z]/, text: "At least one lowercase letter (a–z)" },
    { regex: /[0-9]/, text: "At least one number (0–9)" },
    { regex: /[^a-zA-Z0-9]/, text: "At least one symbol" },
    { regex: /.{8,}/, text: "At least 8 characters long" },
  ];

  const strength = useMemo(
    () => requirements.map((r) => ({ ...r, met: r.regex.test(password) })),
    [password]
  );

  const score = strength.filter((r) => r.met).length;

  const getColor = () => {
    if (score === 0) return "bg-gray-300";
    if (score <= 3) return "bg-red-500";
    if (score === 4 || score === 5) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getText = () => {
    if (score === 0) return "Weak password";
    if (score <= 3) return "Weak password";
    if (score <= 5) return "Medium password";
    return "Strong password";
  };

  return (
    <div className="mb-2 mt-5">
      <label htmlFor="password" className="block text-sm font-light mb-1">
        Password
      </label>

      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters long" },
            pattern: {
              value: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
              message: "Password must contain English characters only",
            },
            validate: {
              hasNumber: (value) => /[0-9]/.test(value) || "Password must contain at least one number (0–9)",
              hasLowercase: (value) => /[a-z]/.test(value) || "Password must contain at least one lowercase letter (a–z)",
              hasUppercase: (value) => /[A-Z]/.test(value) || "Password must contain at least one uppercase letter (A–Z)",
              hasSymbol: (value) => /[^a-zA-Z0-9]/.test(value) || "Password must contain at least one symbol",
            },
          })}
          className="w-full border border-white rounded px-4 py-2 pr-10 bg-transparent text-white [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white z-10"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <Eye size={18} />
        </button>
      </div>

      {errors.password?.message && (
        <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>
      )}

      <>
        {/* <div className="h-2 rounded mt-2 mb-1 w-full bg-gray-700">
          <div className={`h-2 rounded ${getColor()}`} style={{ width: `${(score / requirements.length) * 100}%` }}></div>
        </div>

        <p className="text-sm text-white font-light">{getText()}</p> */}

        <ul className="mt-2 space-y-1">
          {strength.map((req, idx) => (
            <li key={idx} className={`flex items-center gap-2 text-sm ${req.met ? "text-green-400" : "text-gray-400"}`}>
              {req.met ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {req.text}
            </li>
          ))}
        </ul>
      </>
    </div>
  );
};