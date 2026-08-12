import type { HTMLAttributes } from "react";

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative z-[4] flex-none w-full mt-[clamp(-30px,-2.2dvh,-14px)] mx-auto rounded-[13px] bg-white/95 shadow-[0_18px_38px_rgba(26,57,111,0.14)] p-[clamp(17px,2.35dvh,25px)_clamp(20px,6vw,26px)_clamp(18px,2.55dvh,26px)] text-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
