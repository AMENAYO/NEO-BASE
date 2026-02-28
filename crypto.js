import CryptoJS from "crypto-js";

const SECRET = "neo_ultra_secret";

// Encrypt / Chiffrer
export function encrypt(data) {
  return CryptoJS.AES.encrypt(data, SECRET).toString();
}

// Decrypt / Déchiffrer
export function decrypt(data) {
  const bytes = CryptoJS.AES.decrypt(data, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
