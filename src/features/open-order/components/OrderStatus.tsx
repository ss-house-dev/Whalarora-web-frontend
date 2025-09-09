import { Order } from './OrderCard';
import ProgressBar from './ProgressBar';

export default function OrderStatus({ order }: { order: Order }) {
  if (order.status === 'partial') {
    return (
      <>
        <div className="flex items-center text-yellow-400 text-xs mb-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
          Partially Filled
        </div>
        <ProgressBar filledAmount={order.filledAmount} filledPercent={order.filledPercent} />
      </>
    );
  }

  if (order.status === 'pending') {
    return (
      <div className="flex items-center text-blue-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
        Pending
      </div>
    );
  }

  if (order.status === 'filled') {
    return (
      <div className="flex items-center text-green-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
        Completed
      </div>
    );
  }

  if (order.status === 'cancelled') {
    return (
      <div className="flex items-center text-red-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
        Cancelled
      </div>
    );
  }

  return null;
}
