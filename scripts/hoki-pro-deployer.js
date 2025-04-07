// scripts/hoki-pro-deployer.js
require("dotenv").config();
const hre = require("hardhat");
const https = require("https");

// === ENV ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// === Notifikasi Telegram ===
function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
  https.get(url, (res) => {
    res.on("data", () => {});
  }).on("error", (e) => {
    console.error("❌ Gagal kirim ke Telegram:", e);
  });
}

// === Deploy + Verifikasi ===
async function deployAndVerify() {
  console.log("🚀 Deploying contract HokiReceh...");

  const Contract = await hre.ethers.getContractFactory("HokiReceh");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ Contract deployed at:", address);

  // Delay fix 10 menit sebelum verifikasi
  const delayMs = 10 * 60 * 1000;
  console.log(`⏳ Menunggu 10 menit sebelum verifikasi...\n`);
  await new Promise((res) => setTimeout(res, delayMs));

  let verified = false;

  try {
    console.log("🔍 Verifying on explorer...");
    await hre.run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified!");
    verified = true;
  } catch (err) {
    console.error("❌ Verifikasi gagal:", err.message || err);
  }

  const msg = `
✅ *HokiReceh Deployed${verified ? " & Verified*" : "* (verifikasi gagal)*"}

📦 [Alamat](https://sepolia.tea.xyz/address/${address})
🧠 [Explorer](https://sepolia.tea.xyz/address/${address}/contracts)

${verified ? "⚡ Farming ulang sebentar lagi..." : "⏱️ Delay berikutnya 5–10 menit... 🎯"}
  `.trim();

  sendTelegramMessage(msg);
  return verified;
}

// === LOOPER ===
async function loop() {
  while (true) {
    let delaySetelahDeploy = 5 * 60 * 1000;

    try {
      const sukses = await deployAndVerify();

      if (sukses) {
        delaySetelahDeploy = (Math.floor(Math.random() * 3) + 1) * 60 * 1000;
        console.log(`🎯 Verifikasi sukses! Delay selanjutnya ${(delaySetelahDeploy / 60000).toFixed(1)} menit...\n`);
      } else {
        delaySetelahDeploy = (Math.floor(Math.random() * 6) + 5) * 60 * 1000;
        console.log(`⚠️ Verifikasi gagal! Delay selanjutnya ${(delaySetelahDeploy / 60000).toFixed(1)} menit...\n`);
      }
    } catch (err) {
      console.error("❌ Fatal error:", err.message || err);
      sendTelegramMessage("❌ Error fatal saat deploy: " + (err.message || err));
      delaySetelahDeploy = (Math.floor(Math.random() * 6) + 5) * 60 * 1000;
    }

    await new Promise((res) => setTimeout(res, delaySetelahDeploy));
  }
}

loop();
