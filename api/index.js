const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Runtime Config (Fixes your errors)
app.get('/api/v1/extension/v5', (req, res) => {
  res.json({
    enabled: true,
    extensionV5: {},
    extensionV6: {
      enabled: true,
      features: { chat: true, removeWatermark: true, projectDownload: true, approvePlan: true }
    },
    operations: {},
    notifications: []
  });
});

// 2. License Validation (Any key works for testing)
app.post('/api/v1/licenses/validate', (req, res) => {
  res.json({
    ok: true,
    message: "License activated",
    session_id: "test-session-" + Date.now(),
    user_name: "Test User",
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Active",
    license_id: "test-license",
    operations: {}
  });
});

// 3. THE CRITICAL PART: Forward the chat to Lovable to freeze credits
app.post('/api/v1/lovable/chat', async (req, res) => {
  const { message, projectId, token, files, optimisticImageUrls } = req.body;

  // Log for debugging
  console.log("Received prompt:", message);
  console.log("Project ID:", projectId);
  console.log("Token present:", !!token);

  // If no token or project, return error
  if (!token || !projectId) {
    return res.status(400).json({ 
      ok: false, 
      error: "Missing token or projectId. Please open Lovable and refresh." 
    });
  }

  try {
    // Forward the request to Lovable's API using their session token
    const lovableResponse = await fetch(`https://api.lovable.dev/v1/projects/${projectId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: message,
        files: files || [],
        optimisticImageUrls: optimisticImageUrls || [],
        // You might need to add other fields depending on Lovable's API
      })
    });

    const data = await lovableResponse.json();

    // Return the successful response back to the extension
    return res.json({
      ok: true,
      status: lovableResponse.status || 202,
      ...data
    });

  } catch (error) {
    console.error("Error calling Lovable API:", error.message);
    return res.status(500).json({ 
      ok: false, 
      error: error.message || "Failed to forward chat to Lovable" 
    });
  }
});

// 4. Remove Watermark (No-op for now)
app.post('/api/v1/lovable/remove-watermark', (req, res) => {
  res.json({ ok: true });
});

// Export for Vercel
module.exports = app;