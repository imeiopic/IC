// src/notifyBackend.ts
// Backend notification trigger for Email, SMS, Push
import { apiFetch } from '../api';

export async function notifyOrderStatus(orderId, status, channels, recipient) {
  // channels: ['email', 'sms', 'push']
  // recipient: { email, phone, pushToken }
  return apiFetch('/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, status, channels, recipient })
  });
}
