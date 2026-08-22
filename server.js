const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows your extension to talk to it
app.use(express.json({ limit: '50mb' }));

// 1. Runtime Config (Fixes your "Failed to fetch" error)
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

// 2. License Validation (Accepts any key for testing)
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

// 3. Chat (For testing, just logs the prompt)
app.post('/api/v1/lovable/chat', (req, res) => {
  console.log("Prompt received:", req.body.message);
  res.json({ ok: true, status: 202, accepted: true });
});

// 4. Download / Remove Watermark (Placeholders)
app.post('/api/v1/lovable/source-code', (req, res) => {
  res.json({ ok: true, files: [] });
});
app.post('/api/v1/lovable/remove-watermark', (req, res) => {
  res.json({ ok: true });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});