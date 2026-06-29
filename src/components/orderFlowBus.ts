// src/components/orderFlowBus.ts
// Central event bus for live order flow events
import mitt from 'mitt';

export type OrderEvent = {
  order: any;
  node: any;
};

const orderFlowBus = mitt<{
  'order-placed': OrderEvent;
  'order-monitored': { result: any; order: any; node: any };
}>();

export default orderFlowBus;
