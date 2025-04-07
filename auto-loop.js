// auto-loop.js versi PRO by Hokireceh
require("dotenv").config();
const { exec } = require("child_process");
const https = require("https");
const fs = require("fs");
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

function sendTelegramMessage(message) {
  const text = encodeURIComponent(message);
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}`;

  https.get(url, (res) => {
    res.on("data", () => {});
  }).on("error", (e) => {
    console.error("❌ Gagal kirim ke Telegram:", e);
  });
}

function saveDeployedAddress(address) {
  const filePath = path.join(__dirname, "deployed.json");
  let data = [];

  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath));
  }

  data.push({
    address,
    time: new Date().toISOString(),
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function saveLog(stdout) {
  const logFile = path.join(__dirname, "deploy.log");
  fs.appendFileSync(logFile, `[${new Date().toISOString()}]\n${stdout}\n\n`);
}

function deployLoop() {
  console.log("🚀 Memulai deploy dan verifikasi...\n");

  exec("npx hardhat run scripts/deploy-and-verify.js --network tea-sepolia", (err, stdout, stderr) => {
    let addressMatch = stdout.match(/Contract deployed at: (0x[a-fA-F0-9]{40})/);
    let address = addressMatch ? addressMatch[1] : "Gagal ambil alamat 😓";

    saveLog(stdout);

    if (err && err.message.includes("nonce too low")) {
      console.warn("⚠️ Nonce terlalu rendah, retry dalam 1 menit...");
      sendTelegramMessage("⚠️ Nonce terlalu rendah. Coba lagi dalam 1 menit...");
      return setTimeout(deployLoop, 60 * 1000);
    }

    if (stdout.includes("insufficient funds")) {
      sendTelegramMessage("🚨 Gagal deploy: Saldo wallet kurang 💸");
    }

    if (stdout.includes("gas required exceeds allowance")) {
      sendTelegramMessage("🚨 Error Gas Fee: Cek RPC dan jaringan gas!");
    }

    const resultMsg = `
✅ Deploy & Verifikasi selesai!

📦 Alamat Kontrak:
https://sepolia.tea.xyz/address/${address}

🧾 Ringkasan Output:
${address !== "Gagal ambil alamat 😓" ? stdout.slice(0, 1000) : "(Output kosong atau error)"}

🚀 Powered by Hokireceh 🧠
⏳ Next deploy in 5-10 menit...
    `.trim();

    if (address !== "Gagal ambil alamat 😓") {
      saveDeployedAddress(address);
    }

    if (err) {
      console.error(`❌ Error: ${err.message}`);
      sendTelegramMessage(`❌ Deploy error!\n${err.message}`);
    } else {
      if (stderr) console.warn(`⚠️ Stderr: ${stderr}`);
      sendTelegramMessage(resultMsg);
    }

    const randomDelay = (Math.floor(Math.random() * 6) + 5) * 60 * 1000;
    setTimeout(deployLoop, randomDelay);
  });
}

deployLoop();