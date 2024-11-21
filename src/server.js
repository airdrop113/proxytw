import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { twitterAuthRouter } from './routes/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Twitter auth routes
app.use('/api/twitter', twitterAuthRouter);

app.listen(config.server.port, () => {
  console.log(`Proxy server running on http://localhost:${config.server.port}`);
});