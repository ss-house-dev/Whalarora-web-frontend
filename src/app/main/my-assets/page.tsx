import TotalAssetsValueContainer from '@/features/assets-value/containers/TotalAssetsValueContainer';
import HoldingAssetsContainer from '@/features/assets/containers/HoldingAssetsContainer';

export default function MyAssetsPage() {
  return (
    <div className="px-4 pb-10 mt-[20px] lg:px-[23px]">
      <TotalAssetsValueContainer />
      <div className="mt-5">
        <HoldingAssetsContainer pageSize={10} />
      </div>
    </div>
  );
}
