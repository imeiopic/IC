export interface OrderItem {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  sellerID: string;
  buyerID: string;
  items: OrderItem[];
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  totalAmount: number;
}