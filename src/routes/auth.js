import express from 'express';
import fetch from 'node-fetch';
import { config } from '../config.js';

export const twitterAuthRouter = express.Router();

// Helper function to encode credentials to Base64
const getBasicAuthHeader = () => {
  const credentials = `${config.twitter.clientId}:${config.twitter.clientSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

// Get OAuth2 token
twitterAuthRouter.post('/token', async (req, res) => {
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
    console.error('Error getting Twitter token:', error);
    res.status(500).json({ error: 'Failed to get Twitter token' });
  }
});

// Proxy endpoint for Twitter API requests
twitterAuthRouter.post('/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body } = req.body;

    // Add bearer token to request headers
    const requestHeaders = {
      'Authorization': `Bearer ${config.twitter.bearerToken}`,
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
    console.error('Proxy request error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});