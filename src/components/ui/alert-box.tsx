'use client';
import { Anuphan } from 'next/font/google';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const anuphan = Anuphan({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
});

interface AlertBoxProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose?: () => void;
  duration?: number;
}

export default function AlertBox({
  message,
  type = 'success',
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

  const barWidth = progress > 2 ? `${progress}%` : '8px';

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          titleColor: 'text-[#309C7D]',
          title: 'Order Placed',
          icon: (
            <Image
              src="/assets/success-fill.svg"
              alt="Success"
              width={24}
              height={24}
              className="rounded-full"
            />
          ),
        };
      case 'error':
        return {
          titleColor: 'text-[#DC2626]',
          title: 'Error',
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
                fill="#DC2626"
              />
            </svg>
          ),
        };
      default:
        return {
          titleColor: 'text-blue-400',
          title: 'Information',
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
    <div className={`${anuphan.className} relative w-[377px] min-h-[131px] bg-[#1F2029] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden pb-[10px] pt-[10px]`}>
      {/* Colored sidebar */}
      <div className="absolute left-0 top-0 h-full w-4 bg-[#309C7D] rounded-tl-xl rounded-bl-xl" />

      {/* Content */}
      <div className="pl-[31px] pr-[10px] space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-[10px] items-center">
            <div className={`text-[14px] font-[500] ${typeConfig.titleColor}`}>
              {typeConfig.title}
            </div>
            {typeConfig.icon}
          </div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              onClick={handleClose}
              className="cursor-pointer hover:opacity-100 transition-opacity opacity-60"
            >
              <path
                d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z"
                fill="#A4A4A4"
              />
            </svg>
          </div>
        </div>

        {/* Dynamic message */}
        <div className="text-white text-[14px] font-[400] whitespace-pre-line">{message}</div>

        {/* Gradient bar - ระยะห่างซ้ายขวาเท่ากัน */}
        <div className=" mr-[10px] flex items-center h-[7px] relative">
          <div
            className="h-[4px] transition-all duration-200"
            style={{
              width: barWidth,
              borderRadius: progress > 2 ? '999px' : '50%',
              minWidth: '8px',
              maxWidth: '100%',
              boxShadow: progress <= 2 ? '0 0 6px 0 rgba(0,0,0,0.10)' : undefined,
              background: type === 'error' ? '#474747' : type === 'info' ? '#474747' : '#474747',
            }}
          />
        </div>
      </div>
    </div>
  );
}
