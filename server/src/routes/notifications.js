import express from 'express';
import jwt from 'jsonwebtoken';
import { addClient, removeClient } from '../utils/sse.js';

const router = express.Router();

// GET /api/notifications/stream?token=...
router.get('/stream', async (req, res) => {
  try {
    const token = req.query.token || req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).end('Unauthorized');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    } catch (err) {
      return res.status(401).end('Invalid token');
    }

    const userId = decoded.id;

    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    // Send a ping/comment to establish connection
    res.write(': connected\n\n');

    addClient(userId, res);

    req.on('close', () => {
      removeClient(userId, res);
    });
  } catch (err) {
    console.error('SSE stream error:', err);
    res.status(500).end();
  }
});

export default router;
