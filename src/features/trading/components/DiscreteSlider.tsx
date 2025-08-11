"use client";
import * as React from "react";

export default function DiscreteSlider() {
  const markers = [0, 25, 50, 75, 100];      // หมุดคงเดิม
  const [percent, setPercent] = React.useState(0); // เลือกได้ 0–100 (ต่อเนื่อง)
  const barRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);

  const percentFromClientX = (clientX: number) => {
    const el = barRef.current;
    if (!el) return percent;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    return Math.round((x / rect.width) * 100);
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setPercent(percentFromClientX(e.clientX));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setPercent(percentFromClientX(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setPercent(percentFromClientX(e.clientX));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") setPercent((p) => clamp(p + 1));
    if (e.key === "ArrowLeft") setPercent((p) => clamp(p - 1));
    if (e.key === "Home") setPercent(0);
    if (e.key === "End") setPercent(100);
  };

  return (
    <div className="relative select-none">
      {/* Bubble */}
      <div
        className="absolute -top-6 px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#102047] text-white"
        style={{ left: `calc(${percent}% - 12px)` }}
      >
        {percent}%
      </div>

      {/* Bar */}
      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        onClick={handleBarClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative h-6 flex items-center cursor-pointer"
      >
        {/* Track background */}
        <div className="absolute left-0 right-0 h-2 bg-[#102047] rounded-full" />

        {/* Filled progress (gradient ใหม่) */}
        <div
          className="absolute left-0 h-2 rounded-full"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, #1F4293 0%, #49B6AE 82.5%)",
          }}
        />

        {/* Markers (0/25/50/75/100) */}
        <div className="relative w-full h-6">
          {markers.map((m) => {
            const isPassed = m < percent;
            const isEqual = Math.round(percent) === m;
            const isFuture = m > percent;

            return (
              <button
                key={m}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPercent(m);
                }}
                aria-label={`${m}%`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
                style={{ left: `${m}%` }}
              >
                {isEqual ? (
                  // หมุดที่ตรงกับตำแหน่งปัจจุบัน: เขียวโปร่ง + ไส้ขาว
                  <span className="size-6 rounded-full bg-[rgba(38,246,186,0.5)] ring-1 ring-[rgba(38,246,186,0.5)] grid place-items-center">
                    <span className="block size-4 rounded-full bg-white" />
                  </span>
                ) : isPassed ? (
                  // ผ่านแล้ว
                  <span className="block size-5 rounded-full bg-[#2FACA2]" />
                ) : (
                  // ยังไม่ถึง
                  <span className="block size-5 rounded-full bg-[#1F4293]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Thumb ลอยอิสระ (เลือกได้ทุก %) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-6 rounded-full bg-[rgba(38,246,186,0.5)] ring-1 ring-[rgba(38,246,186,0.5)] grid place-items-center pointer-events-none"
          style={{ left: `${percent}%` }}
        >
          <span className="block size-4 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
