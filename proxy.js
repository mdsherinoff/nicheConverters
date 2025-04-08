require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = 3000;

// Ensure API_TOKEN is loaded
if (!process.env.API_TOKEN) {
  console.error("API_TOKEN is missing from the environment variables.");
  process.exit(1);
}

// Enable CORS
app.use(cors());

// Enable logging
app.use(morgan("dev"));

// Proxy route
app.get("/api/player/:tag", async (req, res) => {
  const playerTag = req.params.tag;

  // Validate the player tag
  if (!/^#?[A-Za-z0-9]{8,10}$/.test(playerTag)) {
    return res.status(400).json({ error: "Invalid player tag format." });
  }

  const baseURL = "https://api.clashofclans.com/v1/players/%23";
  const url = `${baseURL}${playerTag}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`, // Securely load the API token
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        return res
          .status(403)
          .json({ error: "Invalid API token or insufficient permissions." });
      } else if (response.status === 404) {
        return res
          .status(404)
          .json({ error: "Player not found. Please check the tag." });
      } else {
        return res.status(500).json({ error: "Failed to fetch player data." });
      }
    }

    const data = await response.json();
    if (!data || typeof data !== "object") {
      throw new Error("Unexpected API response format.");
    }

    res.json(data);
  } catch (error) {
    if (error.type === "system") {
      res.status(500).json({ error: "Network error. Please try again later." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
