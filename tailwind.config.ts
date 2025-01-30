import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primaryBlue: "#3C63FC",
        lightPrimaryBlue: "#5A7CFF",
        // gray: "#ECEDF0",
        gray: {
          50: "#F9FAFB",   // Lightest gray
          100: "#F3F4F6",  // Soft gray
          200: "#E5E7EB",  // Slightly darker
          300: "#D1D5DB",  // Medium gray
          400: "#9CA3AF",  // Default Tailwind gray-400
          500: "#6B7280",  // Dark gray
          600: "#4B5563",  // Deeper gray
          700: "#374151",  // Darker
          800: "#1F2937",  // Very dark
          900: "#111827",  // Almost black
        },
        lightGray: "#E5E7EB",
      },
      fontSize: {
        base: "16px",
        sm: "14px",
        lg: "18px",
        xl: "20px",
        xxs: "10px",
        xs: "12px",
        xxl: "40px",
      },
      spacing: {
        "18": "4.5rem", // 72px
        "22": "5.5rem", // 88px
        "30": "7.5rem", // 120px
        "80px": "80px",
        "20px": "20px",
        "30px": "30px",
        "40px": "40px",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
} satisfies Config;
