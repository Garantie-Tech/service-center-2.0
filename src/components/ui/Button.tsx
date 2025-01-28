"use client";

type ButtonProps = {
  type: "button" | "submit" | "reset";
  label: string;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({ type, label, className }) => (
  <button
    type={type}
    className={`px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded ${className}`}
  >
    {label}
  </button>
);

export default Button;
