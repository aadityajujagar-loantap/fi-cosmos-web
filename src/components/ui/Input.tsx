import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}


export function Input({ className = "", error, ...props }: InputProps) {
  return (
    <input
      className={`w-full border-[1.5px] ${
        error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[#d5dbe5] focus:border-[#174cb3] focus:ring-[#174cb3]"
      } rounded-[11px] px-[clamp(12px,4vw,16px)] text-[#091733] font-medium text-[clamp(13px,3.8vw,16px)] placeholder-[#8f98a8] outline-none transition-all ${className}`}
      {...props}
    />
  );
}

interface PhoneInputProps extends InputHTMLAttributes<HTMLInputElement> {
  countryCode?: string;
  onCountryCodeClick?: () => void;
}

export function PhoneInput({ countryCode = "+91", onCountryCodeClick, className = "", ...props }: PhoneInputProps) {
  return (
    <div className={`flex items-center h-[clamp(52px,7dvh,67px)] border-[1.5px] border-[#d5dbe5] rounded-[11px] bg-white overflow-hidden focus-within:border-[#174cb3] ${className}`}>
      <button
        type="button"
        onClick={onCountryCodeClick}
        className="flex items-center justify-center gap-1.5 h-full w-[68px] border-r border-[#e5e8ee] bg-white text-[#061332] text-lg font-bold cursor-pointer flex-none"
      >
        {countryCode}
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" aria-hidden="true">
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </button>
      <input
        className="min-w-0 flex-1 h-full border-0 outline-none pl-3 pr-1 text-[#091733] text-xl font-bold placeholder-[#8f98a8] placeholder:text-sm placeholder:font-medium"
        {...props}
      />
      <div className="w-9 h-full flex items-center justify-center text-[#8f98a8] pr-3.5 flex-none">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[18px] h-[18px]"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </div>
    </div>
  );
}

interface OtpDigitInputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: (el: HTMLInputElement | null) => void;
}

export function OtpDigitInput({ inputRef, className = "", ...props }: OtpDigitInputProps) {
  return (
    <input
      ref={inputRef}
      className={`w-full h-[clamp(58px,9.2dvh,85px)] border-[1.5px] border-[#c8ced8] rounded-lg bg-white text-[#174cb3] shadow-[inset_0_5px_13px_rgba(9,31,67,0.05)] text-center text-[clamp(30px,10vw,41px)] font-medium outline-none focus:border-[#174cb3] focus:shadow-[0_0_0_1px_#174cb3] transition-all ${className}`}
      {...props}
    />
  );
}
