// orderDeliveryBus.ts
// Central event bus for order delivery and status notifications
import mitt from 'mitt';

export type OrderDeliveryEvent = {
  orderId: string;
  status: 'placed' | 'processing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  trackingUrl?: string;
};

const orderDeliveryBus = mitt<{
  'order-status-update': OrderDeliveryEvent;
}>();

export default orderDeliveryBus;
