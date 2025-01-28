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
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold text-center mb-4">
        Service Center Login
      </h1>
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
        <Button type="submit" label="Login" className="w-full mt-4" />
      </form>
    </div>
  );
};

export default LoginForm;
