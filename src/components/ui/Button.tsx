import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const baseStyle = "w-full rounded-[11px] font-bold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "h-[clamp(52px,7dvh,67px)] bg-gradient-to-b from-[#1e58c8] to-[#123f9f] text-white shadow-[0_7px_14px_rgba(25,75,176,0.23)] text-[clamp(19px,5.5vw,23px)] hover:opacity-95 active:scale-[0.99]",
    secondary: "h-[clamp(52px,7dvh,67px)] bg-white border border-[#d5dbe5] text-[#091733] text-[clamp(15px,4.2vw,18px)] hover:bg-gray-50 active:scale-[0.99]",
    ghost: "text-[#0647b1] text-[clamp(17px,4.8vw,19px)] hover:underline active:scale-[0.98]",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
