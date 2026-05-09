// Simple PayPal payment endpoint (sandbox/demo)
const express = require('express');
const router = express.Router();
const { creditBalance, getBalance } = require('./mesh-nodes');

// This is a placeholder. In production, use the official PayPal SDK and proper verification.
router.post('/api/paypal/pay', async (req, res) => {
  const { amount, payer, type, nodeId } = req.body;
  // Simulate payment processing
  if (!amount || !payer || !type || !nodeId) {
    return res.status(400).json({ error: 'Missing payment info' });
  }
  // Simulate payment success
  setTimeout(() => {
    // Credit IO$ node balance: amount + 50%
    const bonus = amount * 0.5;
    const totalCredit = amount + bonus;
    const newBalance = creditBalance(nodeId, totalCredit);
    res.json({
      status: 'success',
      transactionId: Math.random().toString(36).slice(2),
      credited: totalCredit,
      newBalance
    });
  }, 1000);
});

module.exports = router;
