"use client";

import React from "react";
import Image from "next/image";
import LoginForm from "@/components/forms/LoginForm";

type LoginFormRightSectionProps = {
  onSubmit: (credentials: { email: string; password: string }) => void;
};

const LoginFormRightSection: React.FC<LoginFormRightSectionProps> = ({
  onSubmit,
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/images/v-shield-logo.png"
          alt="V-Shield Logo"
          width={120}
          height={120}
        />
      </div>

      {/* Login Form */}
      <LoginForm onSubmit={onSubmit} />

      {/* Footer */}
      <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
        <span>Powered by</span>
        <Image
          src="/images/garantie-logo.png"
          alt="Garantie Logo"
          width={60}
          height={60}
        />
      </div>
    </div>
  );
};

export default LoginFormRightSection;
