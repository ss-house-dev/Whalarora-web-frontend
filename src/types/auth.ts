import React from "react";

export interface SignInData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface SignInFormProps {
  usernameRef: React.RefObject<HTMLInputElement>;
  passwordRef: React.RefObject<HTMLInputElement>;
  showPassword: boolean;
  formData: SignInData;
  error: string;
  isLoading: boolean;
  onTogglePasswordVisibility: () => void;
  onInputChange: (field: keyof SignInData, value: string | boolean) => void;
  onSignIn: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onGoBack: () => void;
}