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
    <div className="flex flex-col justify-center items-start w-full md:w-1/2 p-10 md:p-[80px]">
      {/* Logo */}
      <div className="md:mb-40px mb-20px">
        <Image
          src="/images/v-shield-logo.png"
          alt="V-Shield Logo"
          width={200}
          height={120}
        />
      </div>

      {/* Login Form */}
      <LoginForm onSubmit={onSubmit} />

      {/* Footer */}
      <div className="mt-80px flex items-center gap-2 text-sm text-gray-500">
        <span>Powered by</span>
        <Image
          src="/images/garantie-logo.png"
          alt="Garantie Logo"
          width={70}
          height={50}
        />
      </div>
    </div>
  );
};

export default LoginFormRightSection;
