import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to encode credentials to Base64
const getBasicAuthHeader = () => {
  const credentials = `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

// Main proxy endpoint
app.post('/proxy', async (req, res) => {
  const { url, method, headers = {}, body } = req.body;

  try {
    // Add bearer token to request headers if not provided
    const requestHeaders = {
      'Authorization': headers.Authorization || `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      ...headers
    };

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth2 token endpoint
app.post('/oauth2/token', async (req, res) => {
  try {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': getBasicAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));