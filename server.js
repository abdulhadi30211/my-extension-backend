const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Runtime Config
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

// 2. License Validation (Accepts any key for now)
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

// 3. Chat (Forwarding to Lovable API)
app.post('/api/v1/lovable/chat', async (req, res) => {
  const { message, projectId, token } = req.body;
  console.log("Prompt received:", message);
  console.log("Project ID:", projectId);
  console.log("Token present:", !!token);

  if (!projectId || !token) {
    return res.status(400).json({ ok: false, error: "Missing projectId or token" });
  }

  try {
    const lovableResponse = await fetch(`https://api.lovable.dev/v1/projects/${projectId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await lovableResponse.json();
    return res.json({ ok: true, ...data });

  } catch (error) {
    console.error("Error forwarding to Lovable:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// 4. Remove Watermark
app.post('/api/v1/lovable/remove-watermark', (req, res) => {
  res.json({ ok: true });
});

// Start the persistent server (Required for Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
