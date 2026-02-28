import express from "express";
import fs from "fs-extra";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt } from "./crypto.js";
import { discoverPeers, broadcast } from "./network.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.static("public"));

const config = await fs.readJson("./config.json");
const STORAGE_PATH = "./storage";
await fs.ensureDir(STORAGE_PATH);

const peers = new Set();
await discoverPeers(config, peers);

// Share peer list
app.get("/peers", (req, res) => {
  res.json([...peers, `http://localhost:${config.port}`]);
});

// Store locally + broadcast
app.post("/store", async (req, res) => {
  const { content } = req.body;
  const id = uuidv4();
  const encrypted = encrypt(content);

  await fs.writeFile(`${STORAGE_PATH}/${id}.neo`, encrypted);

  await broadcast(peers, "/replicate", { id, content: encrypted });

  res.json({ success: true, id });
});

// Replication
app.post("/replicate", async (req, res) => {
  const { id, content } = req.body;
  await fs.writeFile(`${STORAGE_PATH}/${id}.neo`, content);
  res.json({ replicated: true });
});

// Retrieve
app.get("/file/:id", async (req, res) => {
  try {
    const encrypted = await fs.readFile(
      `${STORAGE_PATH}/${req.params.id}.neo`,
      "utf8"
    );
    res.json({ content: decrypt(encrypted) });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

app.listen(config.port, () =>
  console.log(`🚀 NEO NODE ${config.username} running on ${config.port}`)
);
