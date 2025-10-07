'use client';
import { anuphan } from '@/fonts/anuphan';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface AlertBoxProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function AlertBox({ message, onClose, duration = 3000 }: AlertBoxProps) {
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

  // แยกข้อความสำหรับหน้าจอปกติ (แยก "successfully" ออกมา)
  const formatMessageDesktop = (msg: string) => {
    if (msg.includes('submitted successfully')) {
      const parts = msg.split('submitted successfully');
      return {
        line1: parts[0].trim() + ' submitted',
        line2: 'successfully',
      };
    }
    return {
      line1: msg,
      line2: '',
    };
  };

  // แยกข้อความสำหรับมือถือ (แยก "submitted successfully" ทั้งหมด)
  const formatMessageMobile = (msg: string) => {
    if (msg.includes('submitted successfully')) {
      const parts = msg.split('submitted successfully');
      return {
        line1: parts[0].trim(),
        line2: 'submitted successfully',
      };
    }
    return {
      line1: msg,
      line2: '',
    };
  };

  const desktopMessage = formatMessageDesktop(message);
  const mobileMessage = formatMessageMobile(message);

  return (
    <div
      className={`${anuphan.className} relative w-[300px] sm:w-[377px] min-h-[131px] bg-[#1F2029] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden pb-[10px] pt-[10px]`}
    >
      {/* Colored sidebar */}
      <div className="absolute left-0 top-0 h-full w-4 bg-[#309C7D] rounded-tl-xl rounded-bl-xl" />

      {/* Content */}
      <div className="pl-[24px] sm:pl-[31px] pr-[10px] space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-[10px] items-center">
            <div className="text-[14px] font-[500] text-[#309C7D]">Order Placed</div>
            <Image
              src="/assets/success-fill.svg"
              alt="Success"
              width={24}
              height={24}
              className="rounded-full"
            />
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

        {/* Dynamic message - แสดงต่างกันระหว่างมือถือและ Desktop */}
        {/* สำหรับมือถือ */}
        <div className="text-white text-[14px] font-[400] sm:hidden">
          <div>{mobileMessage.line1}</div>
          {mobileMessage.line2 && <div>{mobileMessage.line2}</div>}
        </div>

        {/* สำหรับหน้าจอปกติ */}
        <div className="text-white text-[14px] font-[400] hidden sm:block">
          <div>{desktopMessage.line1}</div>
          {desktopMessage.line2 && <div>{desktopMessage.line2}</div>}
        </div>

        {/* Gradient bar */}
        <div className="mr-[10px] flex items-center h-[7px] relative">
          <div
            className="h-[4px] transition-all duration-200"
            style={{
              width: barWidth,
              borderRadius: progress > 2 ? '999px' : '50%',
              minWidth: '8px',
              maxWidth: '100%',
              boxShadow: progress <= 2 ? '0 0 6px 0 rgba(0,0,0,0.10)' : undefined,
              background: '#474747',
            }}
          />
        </div>
      </div>
    </div>
  );
}
