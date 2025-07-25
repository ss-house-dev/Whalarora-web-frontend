import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface AlertBoxProps {
  onClose?: () => void;
  duration?: number; // milliseconds ทั้งหมดที่จะหดจนสุด
}

export default function AlertBox({ onClose, duration = 3000 }: AlertBoxProps) {
  const [progress, setProgress] = useState(100); // %
  const [show, setShow] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progress animation
  useEffect(() => {
    if (!show) return;
    const totalSteps = 60; // smoother
    const stepMs = duration / totalSteps;
    let curStep = 0;

    intervalRef.current = setInterval(() => {
      curStep += 1;
      setProgress(100 - (100 * curStep) / totalSteps);
      if (curStep >= totalSteps) {
        clearInterval(intervalRef.current!);
        setTimeout(() => setShow(false), 250); // wait a bit for animation
        onClose?.();
      }
    }, stepMs);

    return () => clearInterval(intervalRef.current!);
  }, [duration, onClose, show]);

  // Manual close
  function handleClose() {
    setShow(false);
    onClose?.();
  }

  if (!show) return null;

  // barWidth เปลี่ยนแปลงไปตาม progress (% ของความกว้าง)
  // barWidth = 100% → bar เต็ม, barWidth < 2% → วงกลม
  const barWidth = progress > 2 ? `${progress}%` : "8px"; // 8px = วงกลม

  return (
    <div className="relative w-[425px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden pb-[20px] pt-[20px] transition-all duration-500">
      {/* Teal sidebar */}
      <div className="absolute left-0 top-0 h-full w-4 bg-teal-400 rounded-tl-2xl rounded-bl-2xl" />
      {/* X icon */}
      <button
        aria-label="Close"
        onClick={handleClose}
        className="absolute top-[20px] right-[27px] text-blue-900 hover:opacity-80"
      >
        <X size={24} />
      </button>
      {/* Content */}
      <div className="pl-8 pr-8">
        <div className="text-blue-900 text-[17px] font-bold mb-2 mt-1">
          Limit Buy Order Placed
        </div>
        <div className="text-blue-900 text-[15px] mb-5">
          Your limit order Buy BTC/USDT total 120 USDT <br />
          Submitted <span className="text-teal-500">Successfully</span>
        </div>
        {/* Gradient bar - ระยะห่างซ้ายขวาเท่ากัน */}
        <div className="ml-1 -mr-2 flex items-center h-[7px] relative">
          <div
            className="h-[7px] transition-all duration-200 bg-gradient-to-r from-blue-900 via-purple-500 to-teal-300"
            style={{
              width: barWidth,
              borderRadius: progress > 2 ? "999px" : "50%",
              minWidth: "8px",
              maxWidth: "100%",
              boxShadow:
                progress <= 2 ? "0 0 6px 0 rgba(0,0,0,0.10)" : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
