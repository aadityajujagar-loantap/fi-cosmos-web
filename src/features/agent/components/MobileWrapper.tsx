import { useRef } from "react";
import type { ReactNode } from "react";
import { LanguageDropdown, useDomTranslations, useI18n } from "../i18n";

interface MobileWrapperProps {
  children: ReactNode;
}

export function MobileWrapper({ children }: MobileWrapperProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { language } = useI18n();

  useDomTranslations(rootRef, language);

  return (
    <div ref={rootRef} className="relative w-full min-h-screen h-[100dvh] bg-white overflow-hidden flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {children}
      <LanguageDropdown />
    </div>
  );
}
