interface ProgressBarProps {
  filledAmount?: string;
  filledPercent?: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
}

export default function ProgressBar({
  filledAmount,
  filledPercent = 0,
  height = 8, // ความหนาแท่ง
  trackColor = '#474747', // สีพื้นหลัง (track)
  fillColor = '#28479B', // สีแท่งที่เติม
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, filledPercent));

  return (
    <div className="w-full">
      {/* Track + Fill */}
      <div
        className="relative rounded-full overflow-hidden ring-1 ring-[#243155]/40"
        style={{ height, backgroundColor: trackColor }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>

      <div className="flex justify-between text-[13px] text-slate-400 mt-1">
        <span>Filled : {filledAmount ?? '-'}</span>
        <span>{pct.toFixed(2)} %</span>
      </div>
    </div>
  );
}
