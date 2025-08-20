"use client";
import React from "react";
import { useRef } from "react";
import { signIn } from "next-auth/react";

export default function Page() {
  const userName = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    signIn("credentials", {
      userName: userName.current?.value,
      password: password.current?.value,
      redirect: true,
      callbackUrl: "/main/trading",
    });
  };

  return (
    <div>
      <h1>Login</h1>
      <div className="space-x-5">
        <label>
          Username
          <input
            name="username"
            type="text"
            className="p-2 bg-black mx-2"
            ref={userName}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            className="p-2 bg-black mx-2"
            ref={password}
          />
        </label>
        <button className="p-2 bg-black" onClick={handleLogin}>
          Log in
        </button>
      </div>
    </div>
  );
}
