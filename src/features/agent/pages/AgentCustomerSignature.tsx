import { useState, useRef, useEffect } from "react";


interface AgentCustomerSignatureProps {
  onBack: () => void;
  completedStepsCount?: number;
  setCompletedStepsCount?: (count: number) => void;
}

export function AgentCustomerSignature({
  onBack,
  completedStepsCount = 2,
  setCompletedStepsCount
}: AgentCustomerSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(true);

  const drawPreloadedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear and reset canvas scale
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#07183f";
    
    // Draw Amit Deshmukh mockup signature
    ctx.beginPath();
    
    // 'A'
    ctx.moveTo(50, 80);
    ctx.lineTo(65, 30);
    ctx.lineTo(80, 85);
    ctx.moveTo(56, 58);
    ctx.lineTo(73, 56);
    
    // cursive 'mit Deshmukh'
    ctx.moveTo(80, 85);
    ctx.bezierCurveTo(90, 50, 96, 55, 100, 80); // m
    ctx.bezierCurveTo(104, 50, 110, 55, 114, 80);
    ctx.bezierCurveTo(118, 50, 122, 55, 126, 80);
    ctx.bezierCurveTo(134, 80, 138, 65, 138, 80); // i
    ctx.bezierCurveTo(144, 80, 148, 45, 148, 80); // t
    
    // 'Deshmukh'
    ctx.moveTo(165, 45);
    ctx.bezierCurveTo(150, 45, 155, 80, 175, 80); // D
    ctx.bezierCurveTo(182, 80, 185, 65, 188, 80); // e
    ctx.bezierCurveTo(192, 65, 196, 65, 200, 80); // s
    ctx.bezierCurveTo(204, 45, 208, 45, 208, 80); // h
    ctx.bezierCurveTo(215, 65, 218, 65, 222, 80); // m
    ctx.bezierCurveTo(226, 65, 230, 65, 234, 80); // u
    ctx.bezierCurveTo(240, 65, 242, 45, 242, 80); // k
    ctx.bezierCurveTo(246, 45, 250, 45, 250, 80); // h
    
    // Underline
    ctx.moveTo(110, 95);
    ctx.quadraticCurveTo(190, 75, 260, 78);
    
    // Dots
    ctx.moveTo(242, 88);
    ctx.arc(242, 88, 0.7, 0, 2 * Math.PI);
    ctx.moveTo(252, 89);
    ctx.arc(252, 89, 0.7, 0, 2 * Math.PI);

    ctx.stroke();
    setHasSignature(true);
  };

  // Draw preloaded signature on mount
  useEffect(() => {
    drawPreloadedSignature();
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#07183f";

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    // Adjust coordinates based on DOM elements vs canvas attributes
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleUseSignature = () => {
    if (setCompletedStepsCount && completedStepsCount < 5) {
      setCompletedStepsCount(5);
    }
    onBack();
  };

  return (
    <section className="relative flex flex-col flex-1 bg-white min-h-screen h-[100dvh] overflow-hidden">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1 px-5 pt-4 pb-4 justify-start relative h-full overflow-hidden">
        
        {/* Header */}
        <header className="relative flex items-center justify-center h-12 w-full flex-none">
          <button
            onClick={onBack}
            type="button"
            className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-50 cursor-pointer border-0 text-[#07183f]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-lg font-bold text-[#07183f]">Customer Signature</h1>
          
          <button
            type="button"
            className="absolute right-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-50 cursor-pointer border-0 text-[#07183f]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </header>

        {/* Scrollable signature details */}
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full mt-2 flex flex-col gap-4 pb-16">
          
          {/* Top Info Banner */}
          <div className="flex items-start gap-2.5 w-full bg-[#f4f8ff] rounded-xl p-3 border border-[#d8e6ff] text-left flex-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#1158d4] mt-0.5 flex-none">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <div className="text-xs text-[#1158d4]">
              <p className="m-0 font-bold">Please capture the customer's signature.</p>
              <p className="m-0 mt-0.5 font-medium text-[#5c6a85]">Ensure the signature is clear and within the box.</p>
            </div>
          </div>

          {/* Customer Details Grid Card */}
          <div className="border border-[#edf1f5] rounded-[18px] bg-white shadow-sm p-4 w-full flex-none text-left">
            <h3 className="text-xs font-bold text-[#07183f] border-b border-slate-50 pb-2 mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              
              {/* Name */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#edf5ff] text-[#1158d4] grid place-items-center flex-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[9px] font-bold text-[#8f98a8]">Customer Name</p>
                  <p className="m-0 font-bold text-[#07183f] truncate">Amit Deshmukh</p>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#edf5ff] text-[#1158d4] grid place-items-center flex-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[9px] font-bold text-[#8f98a8]">Mobile Number</p>
                  <p className="m-0 font-bold text-[#07183f] truncate">+91 98765 43210</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#edf5ff] text-[#1158d4] grid place-items-center flex-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                    <circle cx="12" cy="9" r="2" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[9px] font-bold text-[#8f98a8]">Location</p>
                  <p className="m-0 font-bold text-[#07183f] truncate">Pune, Maharashtra</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#edf5ff] text-[#1158d4] grid place-items-center flex-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[9px] font-bold text-[#8f98a8]">Date & Time</p>
                  <p className="m-0 font-bold text-[#07183f] truncate text-[10px]">16 May 2025, 11:15 AM</p>
                </div>
              </div>

            </div>
          </div>

          {/* Drawing Box Signature Canvas */}
          <div className="flex flex-col w-full flex-none text-left">
            <div className="flex items-center justify-between w-full mb-2">
              <h3 className="text-xs font-bold text-[#07183f]">Customer Signature</h3>
              <button
                onClick={handleClear}
                type="button"
                className="flex items-center gap-1 text-[10px] font-bold text-[#1158d4] bg-transparent border-0 cursor-pointer hover:underline"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>Clear</span>
              </button>
            </div>
            
            <div className="border border-dashed border-[#b3d1ff] rounded-2xl bg-white overflow-hidden p-1 shadow-sm">
              <canvas
                ref={canvasRef}
                width={380}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[160px] bg-white cursor-crosshair touch-none"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-[#088d27] font-bold mt-2.5 px-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" className="w-3.5 h-3.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
              <span>Signature will be securely captured and stored.</span>
            </div>
          </div>

          {/* Tips Banner */}
          <div className="flex items-start gap-2.5 w-full bg-[#f4f8ff] rounded-xl p-3 border border-[#d8e6ff] text-left flex-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#1158d4] mt-0.5 flex-none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="text-xs text-[#1158d4]">
              <p className="m-0 font-bold">Tips</p>
              <ul className="m-0 mt-1 pl-4 list-disc flex flex-col gap-1 leading-snug font-medium text-[#5c6a85]">
                <li>Ask the customer to sign in the box above.</li>
                <li>Signature should be clear and within the box.</li>
              </ul>
            </div>
          </div>

          {/* Preview Pane */}
          {hasSignature && (
            <div className="flex flex-col text-left flex-none">
              <div className="flex items-center justify-between w-full mb-2">
                <h3 className="text-xs font-bold text-[#07183f]">Signature Preview</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#1158d4]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview</span>
                </span>
              </div>
              <div className="border border-slate-100 rounded-xl bg-slate-50 p-2.5 flex items-center justify-center h-20 overflow-hidden shadow-inner">
                {/* Renders mini vector mockup signature */}
                <svg viewBox="0 0 300 100" className="h-full w-auto text-[#07183f] stroke-current" fill="none" strokeWidth="2.5">
                  <path d="M50 70 L65 30 L80 75 M56 58 L73 56" />
                  <path d="M80 75 Q90 40 100 70 T114 70 T126 70" />
                  <path d="M110 85 Q190 65 250 68" />
                </svg>
              </div>
            </div>
          )}

        </div>

        {/* Footer buttons row */}
        <div className="absolute bottom-4 left-5 right-5 z-20 w-[calc(100%-40px)] max-w-[390px] mx-auto flex items-center gap-3 flex-none">
          <button
            onClick={drawPreloadedSignature}
            type="button"
            className="flex-1 bg-white border border-[#1158d4] text-[#1158d4] hover:bg-slate-50 h-12 rounded-[14px] font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Capture Again</span>
          </button>
          <button
            onClick={handleUseSignature}
            type="button"
            className="w-[60%] bg-[#1158d4] text-white hover:bg-[#0f4ebc] h-12 rounded-[14px] font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform border-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-white">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Use Signature</span>
          </button>
        </div>

      </div>
    </section>
  );
}
