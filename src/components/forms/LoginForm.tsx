"use client";

import React, { useState } from "react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

type LoginFormProps = {
  onSubmit: (credentials: { email: string; password: string }) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });

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
      <h1 className="md:text-xxl text-2xl font-bold md:mb-40px mb-20px">Service Centre Platform</h1>
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
          <InputField
            label="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
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
