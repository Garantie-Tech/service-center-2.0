"use client";

import React, { useState } from "react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import Image from "next/image";

type LoginFormProps = {
  onSubmit: (credentials: { email: string; password: string }) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  return (
    <div className="w-full bg-white rounded">
      <h1 className="md:text-xxl text-2xl font-bold md:mb-40px mb-20px">
        Service Centre Platform
      </h1>
      <div className="w-full md:w-[70%]">
        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          {/* Password Field with SVG Toggle */}
          <div className="relative">
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-[40px] right-3"
            >
              {showPassword ? (
                // Eye Open Icon
                <Image
                  src="/images/eye-on.svg"
                  alt="Logout"
                  width={24}
                  height={20}
                />
              ) : (
                // Eye Closed Icon
                <Image
                  src="/images/eye-off.svg"
                  alt="Logout"
                  width={24}
                  height={20}
                />
              )}
            </button>
          </div>

          <Button
            type="submit"
            label="Submit"
            className="bg-primaryBlue w-full mt-4 rounded-[8px]"
          />
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
