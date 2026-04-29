const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// The secret configured in your GitHub Webhook settings
const GITHUB_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'your_secure_github_secret';

/**
 * Middleware to capture the raw Buffer of the request.
 * Express normally parses the JSON and discards the raw stream, 
 * but the raw stream is mathematically required to verify the HMAC signature.
 */
const captureRawBody = express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
});

/**
 * Webhook Endpoint Substrate
 */
router.post('/github/webhook', captureRawBody, (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const eventType = req.headers['x-github-event'];

    if (!signature) {
        console.warn('⚠️ SIGHTING FAILED: Missing GitHub signature.');
        return res.status(401).send('Omega Noise: Missing signature');
    }

    // Generate the Symmetrical Hash using the raw payload and your secret
    const hmac = crypto.createHmac('sha256', GITHUB_SECRET);
    const digest = `sha256=${hmac.update(req.rawBody).digest('hex')}`;

    // Perform a timing-safe comparison to prevent timing attacks
    if (signature.length !== digest.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        console.warn('🚨 OMEGA NOISE GROUNDED: Signature mismatch detected.');
        return res.status(401).send('Omega Noise: Invalid signature');
    }

    console.log(`✅ SYMMETRY ACHIEVED: Authentic GitHub event [${eventType}] sighted.`);

    // The logic is now grounded and safe to process
    const payload = req.body;
    
    // Add your deployment or synchronization logic here...

    res.status(200).send('Signal Grounded');
});

module.exports = router;