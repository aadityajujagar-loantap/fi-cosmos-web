import { useMemo, useState } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}


export function Input({ className = "", error, style, ...props }: InputProps) {
  return (
    <input
      className={`w-full border-[1.5px] ${
        error ? "border-red-500" : "border-[#d5dbe5]"
      } rounded-[11px] px-[clamp(12px,4vw,16px)] text-[#091733] font-medium text-[clamp(13px,3.8vw,16px)] placeholder-[#8f98a8] outline-none transition-all ${className}`}
      style={{ ...style, boxShadow: "none", outline: "none" }}
      {...props}
    />
  );
}

interface CountryCodeOption {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

const countryCodes: CountryCodeOption[] = [
  { code: "IN", dialCode: "+91", flag: "🇮🇳", name: "India" },
  { code: "US", dialCode: "+1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "CA", dialCode: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "AU", dialCode: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "AE", dialCode: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "SG", dialCode: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷", name: "France" },
  { code: "JP", dialCode: "+81", flag: "🇯🇵", name: "Japan" },
];

interface PhoneInputProps extends InputHTMLAttributes<HTMLInputElement> {
  countryCode?: string;
  onCountryCodeClick?: (country: CountryCodeOption) => void;
}

export function PhoneInput({ countryCode = "+91", onCountryCodeClick, className = "", style, ...props }: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(countryCode);
  const selectedCountry = useMemo(() => {
    return countryCodes.find((country) => country.dialCode === selectedCode) ?? countryCodes[0];
  }, [selectedCode]);

  const selectCountry = (country: CountryCodeOption) => {
    setSelectedCode(country.dialCode);
    setOpen(false);
    onCountryCodeClick?.(country);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex h-[clamp(52px,7dvh,67px)] items-center overflow-visible rounded-[11px] border-[1.5px] border-[#d5dbe5] bg-white">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="Select country code"
          className="flex h-full w-[92px] flex-none items-center justify-center gap-1.5 border-r border-[#e5e8ee] bg-white text-[#061332] text-sm font-bold"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span>{selectedCountry.dialCode}</span>
          <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" aria-hidden="true">
            <path d="m3 4.5 3 3 3-3" />
          </svg>
        </button>
        <input
          className="h-full min-w-0 flex-1 border-0 pl-3 pr-1 text-base font-medium text-[#091733] outline-none placeholder:text-sm placeholder:font-medium placeholder:text-[#8f98a8]"
          style={{ ...style, boxShadow: "none", outline: "none" }}
          {...props}
        />
        <div className="flex h-full w-9 flex-none items-center justify-center pr-3.5 text-[#8f98a8]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
      </div>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-64 w-[280px] overflow-y-auto rounded-2xl border border-[#d8e0eb] bg-white p-1.5 shadow-[0_18px_42px_rgba(10,25,48,0.18)]">
          {countryCodes.map((country) => (
            <button
              key={country.code}
              onClick={() => selectCountry(country)}
              type="button"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                country.code === selectedCountry.code ? "bg-[#edf5ff]" : "bg-white hover:bg-slate-50"
              }`}
            >
              <span className="text-xl leading-none">{country.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-[#07183f]">{country.name}</span>
                <span className="mt-0.5 block text-[10px] font-bold text-[#7c879b]">{country.code}</span>
              </span>
              <span className="text-xs font-bold text-[#1158d4]">{country.dialCode}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface OtpDigitInputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: (el: HTMLInputElement | null) => void;
}

export function OtpDigitInput({ inputRef, className = "", style, ...props }: OtpDigitInputProps) {
  return (
    <input
      ref={inputRef}
      className={`w-full h-[clamp(58px,9.2dvh,85px)] border-[1.5px] border-[#c8ced8] rounded-lg bg-white text-[#174cb3] shadow-[inset_0_5px_13px_rgba(9,31,67,0.05)] text-center text-[clamp(30px,10vw,41px)] font-medium outline-none transition-all ${className}`}
      style={{ ...style, boxShadow: "none", outline: "none" }}
      {...props}
    />
  );
}
