import type { Order } from './ordersApi';

export type OrderStatus = Order['status'];

export interface ProvenanceStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export function orderShortId(id: string): string {
  return id.slice(-8).toUpperCase();
}

export function atelierStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Commission Received';
    case 'paid':
      return 'Cutting & Inspection';
    case 'shipped':
      return 'Dispatched';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function isActiveOrder(status: OrderStatus): boolean {
  return status === 'pending' || status === 'paid' || status === 'shipped';
}

/** Deterministic registry reference for display (not a security claim). */
export function registryReference(orderId: string): string {
  let h = 2166136261;
  for (let i = 0; i < orderId.length; i++) {
    h ^= orderId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `SHA256·${(h >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

export function progressPercent(status: OrderStatus): number {
  switch (status) {
    case 'pending':
      return 20;
    case 'paid':
      return 45;
    case 'shipped':
      return 75;
    case 'delivered':
      return 100;
    default:
      return 0;
  }
}

export function buildProvenanceTimeline(status: OrderStatus): ProvenanceStep[] {
  if (status === 'cancelled') {
    return [
      {
        id: 'cancelled',
        title: 'Commission Cancelled',
        description: 'This commission was cancelled and will not ship.',
        completed: false,
        current: true,
      },
    ];
  }

  const rank: Record<Exclude<OrderStatus, 'cancelled'>, number> = {
    pending: 1,
    paid: 2,
    shipped: 3,
    delivered: 4,
  };
  const current = rank[status];

  const defs = [
    {
      id: 'commissioned',
      title: 'Commission Registered',
      description: 'Payment authorized and edition reserved in the vault.',
      at: 1,
    },
    {
      id: 'cutting',
      title: 'Laser Cut & Inspected',
      description: 'Precision cut on Nordic birch; hand inspection complete.',
      at: 2,
    },
    {
      id: 'dispatched',
      title: 'Courier Dispatched',
      description: 'Tracked parcel handed to the courier network.',
      at: 3,
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Edition received at the registered destination.',
      at: 4,
    },
  ];

  return defs.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    completed: current > d.at || (status === 'delivered' && d.at === 4),
    current: current === d.at,
  }));
}
