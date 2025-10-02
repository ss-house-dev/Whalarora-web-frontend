import TotalAssetsValueContainer from '@/features/assets-value/containers/TotalAssetsValueContainer';
import HoldingAssetsContainer from '@/features/assets/containers/HoldingAssetsContainer';

export default function MyAssetsPage() {
  return (
    <div className="px-4 pb-10 pt-6 md:px-8">
      <TotalAssetsValueContainer />
      <div className="mt-6">
        <HoldingAssetsContainer pageSize={10} />
      </div>
    </div>
  );
}
