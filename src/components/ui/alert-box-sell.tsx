"use client";
import { useEffect, useRef, useState } from "react";

interface AlertBoxProps {
  message: string;
  type?: "success" | "info" | "error";
  onClose?: () => void;
  duration?: number; 
}

export default function AlertBox({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: AlertBoxProps) {
  const [progress, setProgress] = useState(100); 
  const [show, setShow] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progress animation 
  useEffect(() => {
    if (!show) return;

    const totalSteps = 60; 
    const stepMs = duration / totalSteps;
    const stepDecrement = 100 / totalSteps; 

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - stepDecrement;
        if (newProgress <= 0) {
          clearInterval(intervalRef.current!);
          setTimeout(() => {
            setShow(false);
            onClose?.();
          }, 100); 
          return 0;
        }

        return newProgress;
      });
    }, stepMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [duration, onClose, show]);

  // Manual close
  function handleClose() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setShow(false);
    onClose?.();
  }

  if (!show) return null;

  const barWidth = progress > 2 ? `${progress}%` : "8px"; 

  // กำหนดสีและไอคอนตาม type
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          titleColor: "text-[#47CD89]",
          title: "Order Placed",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 24C18.6276 24 24 18.6276 24 12C24 5.3724 18.6276 0 12 0C5.3724 0 0 5.3724 0 12C0 18.6276 5.3724 24 12 24ZM18.5484 8.9484L10.8 16.6968L5.7516 11.6484L7.4484 9.9516L10.8 13.3032L16.8516 7.2516L18.5484 8.9484Z"
                fill="#47CD89"
              />
            </svg>
          ),
        };
      case "error":
        return {
          sidebarColor: "bg-red-400",
          titleColor: "text-red-400",
          title: "Error",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 24C5.3724 24 0 18.6276 0 12C0 5.3724 5.3724 0 12 0C18.6276 0 24 5.3724 24 12C24 18.6276 18.6276 24 12 24ZM12 13.414L16.243 17.657L17.657 16.243L13.414 12L17.657 7.757L16.243 6.343L12 10.586L7.757 6.343L6.343 7.757L10.586 12L6.343 16.243L7.757 17.657L12 13.414Z"
                fill="#EF4444"
              />
            </svg>
          ),
        };
      case "info":
      default:
        return {
          sidebarColor: "bg-blue-400",
          titleColor: "text-blue-400",
          title: "Information",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 24C5.3724 24 0 18.6276 0 12C0 5.3724 5.3724 0 12 0C18.6276 0 24 5.3724 24 12C24 18.6276 18.6276 24 12 24ZM11 7V9H13V7H11ZM11 11V17H13V11H11Z"
                fill="#60A5FA"
              />
            </svg>
          ),
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <>
      {/* Google Fonts import for Anuphan */}
      <link
        href="https://fonts.googleapis.com/css2?family=Anuphan:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        className="relative w-[378px] min-h-[132px] bg-[#13285A] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden pb-[10px] pt-[10px] transition-all duration-500"
        style={{ fontFamily: "Anuphan, sans-serif" }}
      >
        {/* Colored sidebar */}
        <div
          className={`absolute left-0 top-0 h-full w-4 bg-[#17B26A] rounded-tl-2xl rounded-bl-2xl`}
        />
        {/* Content */}
        <div className="pl-8 pr-8 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-[10px] items-center">
              <div
                className={`text-[14px] font-[500] ${typeConfig.titleColor}`}
              >
                {typeConfig.title}
              </div>
              {typeConfig.icon}
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                onClick={handleClose}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <path
                  d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18ZM10 8.586L12.828 5.757L14.243 7.172L11.414 10L14.243 12.828L12.828 14.243L10 11.414L7.172 14.243L5.757 12.828L8.586 10L5.757 7.172L7.172 5.757L10 8.586Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          {/* Dynamic message */}
          <div className="text-white text-[14px] font-[400] whitespace-pre-line">
            {message}
          </div>

          {/* Gradient bar - ระยะห่างซ้ายขวาเท่ากัน */}
          <div className="ml-1 -mr-2 flex items-center h-[7px] relative">
            <div
              className="h-[7px] transition-all duration-200"
              style={{
                width: barWidth,
                borderRadius: progress > 2 ? "999px" : "50%",
                minWidth: "8px",
                maxWidth: "100%",
                boxShadow:
                  progress <= 2 ? "0 0 6px 0 rgba(0,0,0,0.10)" : undefined,
                background:
                  type === "error"
                    ? "linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), linear-gradient(90deg, #DC2626 -1.46%, #EF4444 99.99%)"
                    : type === "info"
                    ? "linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), linear-gradient(90deg, #2563EB -1.46%, #60A5FA 99.99%)"
                    : "linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), linear-gradient(90deg, #1F4293 -1.46%, #26F6BA 99.99%)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
