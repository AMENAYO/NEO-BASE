import axios from "axios";

// Discover peers / Découverte des pairs
export async function discoverPeers(config, peers) {
  for (const peer of config.bootstrapPeers) {
    try {
      const res = await axios.get(`${peer}/peers`);
      res.data.forEach(p => peers.add(p));
      peers.add(peer);
    } catch {}
  }
}

// Broadcast data / Diffuser les données
export async function broadcast(peers, path, data) {
  for (const peer of peers) {
    try {
      await axios.post(`${peer}${path}`, data);
    } catch {}
  }
}
