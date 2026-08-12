interface PopupProps {
  message: string;
}

export function Popup({ message }: PopupProps) {
  if (!message) return null;

  return (
    <div className="fixed z-50 top-[clamp(14px,2.5dvh,24px)] left-1/2 -translate-x-1/2 w-[min(calc(100%-40px),330px)] rounded-[14px] bg-[#132456] text-white shadow-[0_16px_36px_rgba(8,25,55,0.22)] p-[14px_18px] text-center text-[15px] font-bold">
      {message}
    </div>
  );
}
