import CryptoJS from "crypto-js";

const SECRET = "neo_ultra_secret";

// AES encrypt / Chiffrer
export function encrypt(data) {
  return CryptoJS.AES.encrypt(data, SECRET).toString();
}

// AES decrypt / Déchiffrer
export function decrypt(data) {
  const bytes = CryptoJS.AES.decrypt(data, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// SHA256 hash for passwords / Hash SHA256 pour mot de passe
export function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}
