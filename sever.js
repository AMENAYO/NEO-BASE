import express from "express";
import fs from "fs-extra";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt, hashPassword } from "./crypto.js";
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

// Users in memory / Utilisateurs en mémoire
const users = {}; // username -> password hash

// Register / Inscription
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if(users[username]) return res.status(400).json({ error: "User exists / Utilisateur existe" });
  users[username] = hashPassword(password);
  res.json({ success: true });
});

// Login / Connexion
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if(users[username] !== hashPassword(password)) return res.status(401).json({ error: "Invalid / Invalide" });
  res.json({ success: true });
});

// Store data / Stocker les données
app.post("/store", async (req, res) => {
  const { content, username, password } = req.body;
  if(users[username] !== hashPassword(password)) 
    return res.status(401).json({ error: "Invalid user / Utilisateur invalide" });

  const id = uuidv4();
  const encrypted = encrypt(content);

  const userPath = `${STORAGE_PATH}/${username}`;
  await fs.ensureDir(userPath);
  await fs.writeFile(`${userPath}/${id}.neo`, encrypted);

  await broadcast(peers, "/replicate", { id, content: encrypted });

  res.json({ success: true, id });
});

// Replicate / Réplication
app.post("/replicate", async (req, res) => {
  const { id, content } = req.body;
  await fs.writeFile(`${STORAGE_PATH}/${id}.neo`, content);
  res.json({ replicated: true });
});

// List user files / Lister fichiers utilisateur
app.get("/files/:username", async (req, res) => {
  const userPath = `${STORAGE_PATH}/${req.params.username}`;
  try {
    const files = await fs.readdir(userPath);
    res.json({ files });
  } catch {
    res.status(404).json({ error: "No files / Aucun fichier" });
  }
});

app.listen(config.port, () => console.log(`🚀 NEO NODE running on port ${config.port}`));
