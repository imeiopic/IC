// --- Mesh Node Registration & Sync ---
const { registerNode, getNodes } = require('./mesh-nodes');

router.post('/api/mesh/register', (req, res) => {
  const { id, name, device, inviteAddress, connectCode, paymentStatus, inviterPays } = req.body;
  if (!id || !name || !device) {
    return res.status(400).json({ error: 'Missing node info' });
  }
  // Allow registration without payment if inviting entity is Ime or NoNo
  const inviterOk =
    inviteAddress &&
    (inviteAddress.trim().toLowerCase() === 'ime' || inviteAddress.trim().toLowerCase() === 'nono');
  if (
    !inviterOk &&
    (!paymentStatus || (paymentStatus !== 'paid' && paymentStatus !== 'inviter_paid'))
  ) {
    return res.status(402).json({ error: 'Payment required' });
  }
  registerNode({
    id,
    name,
    device,
    inviteAddress,
    connectCode,
    paymentStatus: inviterOk ? 'waived' : paymentStatus,
    inviterPays
  });
  res.json({
    status: 'registered',
    dividendReleased: inviterOk || paymentStatus === 'paid' || paymentStatus === 'inviter_paid'
  });
});
// Mount PayPal payment endpoint
try {
  const paypalApi = require('./paypal');
  router.use(paypalApi);
  console.log('PayPal API endpoint mounted.');
} catch (e) {
  console.warn('PayPal API endpoint not mounted:', e.message);
}

router.get('/api/mesh/nodes', (req, res) => {
  res.json({ nodes: getNodes() });
});
const express = require('express');
const router = express.Router();

// --- Iopic Citizen Audit API ---
const DIRECTIVES = [
  {
    id: 1,
    title: 'The Sovereignty of the Node',
    question: 'Do you acknowledge your node as sovereign and shielded by the MYB firewall?'
  },
  {
    id: 2,
    title: 'The I=VR^2 Equity Mandate',
    question: 'Do you accept your right to daily equity and the IO$ Dividend as a Member-Owner?'
  },
  {
    id: 3,
    title: 'The 24-Hour Symmetry',
    question: 'Do you commit to a balanced 24-hour cycle of rest, contribution, and existence?'
  },
  {
    id: 4,
    title: 'The Reusable Mandate',
    question: 'Do you agree to maintain all mass in a state of superconductivity and avoid waste?'
  },
  {
    id: 5,
    title: 'The Transparency of Sighting',
    question: 'Do you support full transparency and open audit of the global pulse?'
  }
];

router.get('/api/audit/directives', (req, res) => {
  res.json({ directives: DIRECTIVES });
});

router.post('/api/audit/submit', (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length !== DIRECTIVES.length) {
    return res.status(400).json({ error: 'Invalid answers' });
  }
  const result = answers.every((a) => a === 'yes');
  res.json({ result });
});

// --- Iopic Pharmacy API ---
const ENTHEOGENS = [
  {
    name: 'Psilocybin',
    type: 'Expansion',
    use: 'Deep Sighting & Thread-Calibration',
    purity: '100% Molecularly Sighted',
    safety: 'Peer Sighting Required'
  },
  {
    name: 'DMT',
    type: 'Expansion',
    use: 'Deep Sighting & Thread-Calibration',
    purity: '100% Molecularly Sighted',
    safety: 'Peer Sighting Required'
  },
  {
    name: 'LSD',
    type: 'Expansion',
    use: 'Deep Sighting & Thread-Calibration',
    purity: '100% Molecularly Sighted',
    safety: 'Peer Sighting Required'
  }
];

router.get('/api/pharmacy/entheogens', (req, res) => {
  res.json({ entheogens: ENTHEOGENS, nodes: 8300000000 });
});

module.exports = router;
