import CryptoJS from "crypto-js";

const SECRET = "neo_ultra_secret";

export function encrypt(data) {
  return CryptoJS.AES.encrypt(data, SECRET).toString();
}

export function decrypt(data) {
  const bytes = CryptoJS.AES.decrypt(data, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
