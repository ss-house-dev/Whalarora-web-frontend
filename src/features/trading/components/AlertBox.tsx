import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // เพิ่ม

interface AlertBoxProps {
  onClose?: () => void;
  duration?: number;
  title?: string;
  message?: React.ReactNode;
  status?: "success" | "error";
}

export default function AlertBox({
  onClose,
  duration = 3000,
  title = "Alert",
  message = "",
  status = "success",
}: AlertBoxProps) {
  const [progress, setProgress] = useState(100);
  const [show, setShow] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!show) return;
    const totalSteps = 60;
    const stepMs = duration / totalSteps;
    let curStep = 0;

    intervalRef.current = setInterval(() => {
      curStep += 1;
      setProgress(100 - (100 * curStep) / totalSteps);
      if (curStep >= totalSteps) {
        clearInterval(intervalRef.current!);
        setTimeout(() => setShow(false), 250);
        onClose?.();
      }
    }, stepMs);

    return () => clearInterval(intervalRef.current!);
  }, [duration, onClose, show]);

  function handleClose() {
    setShow(false);
    onClose?.();
  }

  // สีตามสถานะ
  const sideColor = status === "error" ? "bg-red-500" : "bg-teal-400";
  const titleColor = status === "error" ? "text-red-600" : "text-blue-900";
  const barGradient =
    status === "error"
      ? "bg-gradient-to-r from-red-600 via-purple-500 to-blue-400"
      : "bg-gradient-to-r from-blue-900 via-purple-500 to-teal-300";

  const barWidth = progress > 2 ? `${progress}%` : "8px";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-6 right-8 z-[9999] bg-white inline-block max-w-[475px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden pb-[20px] pt-[20px] px-8 transition-all duration-500"
          initial={{ opacity: 0, y: -30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -25, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        >
          {/* สีข้าง */}
          <div
            className={`absolute left-0 top-0 h-full w-4 ${sideColor} rounded-tl-2xl rounded-bl-2xl`}
          />
          {/* X icon */}
          <button
            aria-label="Close"
            onClick={handleClose}
            className="absolute top-[20px] right-[27px] text-blue-900 hover:opacity-80"
          >
            <X size={24} />
          </button>
          {/* Content */}
          <div>
            <div className={`text-[17px] font-bold mb-2 mt-1 ${titleColor}`}>
              {title}
            </div>
            <div className="text-blue-900 text-[15px] mb-5 whitespace-nowrap overflow-x-auto">
              {message}
            </div>
            {/* Gradient bar */}
            <div className="ml-1 -mr-2 flex items-center h-[7px] relative">
              <div
                className={`h-[7px] transition-all duration-200 ${barGradient}`}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
