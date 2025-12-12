// ------------------------------
// Standup Forwarder Bot (Zoho Cliq)
// ------------------------------
const express = require("express");
const fetch = require("node-fetch");  // npm install node-fetch@2
const app = express();

app.use(express.json());

// ==== CONFIG ====
// Your target channel: #standup
const CHANNEL_UNIQUE_NAME = "standup";

// Your channel API endpoint (from your connector info)
const CHANNEL_POST_URL = "https://cliq.zoho.com/company/904375926/api/v2/channelsbyname/standup/message";

// OPTIONAL: If your channel requires a webhook token, append it like:
// const CHANNEL_POST_URL = "https://cliq.zoho.com/company/904375926/api/v2/channelsbyname/standup/message?zapikey=YOUR_TOKEN";

// ================================
// Helper: Detect if message is a ScrumBot Standup Response
// ================================
function isStandupMessage(text) {
    if (!text) return false;

    // Detect key patterns unique to your message
    return (
        text.includes("Standup -") &&
        text.includes("What did you work on yesterday?") &&
        text.includes("What will you do today?") &&
        text.includes("Any obstacles?")
    );
}

// ================================
// Participation Handler Endpoint
// ================================
app.post("/cliq/participation", async (req, res) => {
    const message = req.body?.message?.text ?? req.body?.message ?? "";
    const sender = req.body?.sender?.name ?? "Unknown User";

    // Ignore empty or invalid messages
    if (!message) return res.status(200).send("ignored");

    // Check if this is a standup reply
    if (isStandupMessage(message)) {
        console.log("Detected standup response from:", sender);

        const forwardPayload = {
            text: `📢 *Daily Standup Submission from ${sender}:*\n\n${message}`
        };

        try {
            // Forward to #standup
            const resp = await fetch(CHANNEL_POST_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(forwardPayload),
            });

            const result = await resp.text();
            console.log("Forward result:", result);
        } catch (error) {
            console.error("Forwarding Error:", error);
        }
    }

    res.status(200).send("ok");
});

// ================================
// Server Start
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Standup Forwarder running on port ${PORT}`));
