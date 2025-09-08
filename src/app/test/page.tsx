// app/(your-segment)/page.tsx
// ปรับ path ของ HoldingAssetsTable ให้ตรงโปรเจกต์ของคุณ
import HoldingAssetsTable from '@/features/trading/containers/HoldingAssetsTable';

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-[#070E21] text-white">
      <div className="mx-auto max-w-[1296px] px-4 py-6">
        <HoldingAssetsTable />
      </div>
    </main>
  );
}
