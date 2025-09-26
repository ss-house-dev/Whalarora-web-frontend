export type OrderStatusMetaKey = 'pending' | 'partial' | 'filled' | 'cancelled';

export const ORDER_STATUS_META: Record<OrderStatusMetaKey, { label: string; dotColor: string; textColor: string }> = {
  pending: { label: 'Pending', dotColor: '#215EEC', textColor: '#6F8BFF' },
  partial: { label: 'Partially Filled', dotColor: '#FFD477', textColor: '#FFD477' },
  filled: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  cancelled: { label: 'Closed', dotColor: '#474747', textColor: '#A4A4A4' },
};

export type OrderSide = 'buy' | 'sell';

export const ORDER_SIDE_META: Record<OrderSide, { label: string; badgeColor: string }> = {
  buy: { label: 'Buy', badgeColor: '#217871' },
  sell: { label: 'Sell', badgeColor: '#D84C4C' },
};

export type HistoryStatus = 'complete' | 'closed';

export const HISTORY_STATUS_META: Record<HistoryStatus, { label: string; dotColor: string; textColor: string }> = {
  complete: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  closed: { label: 'Closed', dotColor: '#474747', textColor: '#A4A4A4' },
};

export function normalizeOrderStatus(status?: string): OrderStatusMetaKey {
  switch (status?.toLowerCase()) {
    case 'open':
    case 'pending':
      return 'pending';
    case 'partial':
    case 'partially_filled':
      return 'partial';
    case 'filled':
    case 'closed':
    case 'complete':
      return 'filled';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    default:
      return 'pending';
  }
}
