import HoldingAssetsContainer from '@/features/assets/containers/HoldingAssetsContainer';

export default function MyAssetsPage() {
  return (
    <div>
      <HoldingAssetsContainer pageSize={10} />
    </div>
  );
}
