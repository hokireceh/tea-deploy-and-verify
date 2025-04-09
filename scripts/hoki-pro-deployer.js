// scripts/hoki-pro-deployer.js
require("dotenv").config();
const hre = require("hardhat");
const https = require("https");

let ora, chalk;
(async () => {
  ora = (await import("ora")).default;
  chalk = (await import("chalk")).default;
  loop(); // start looping setelah import selesai
})();

// === ENV ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// === Utility ===
function logInfo(msg) {
  console.log(chalk.gray(`[${new Date().toLocaleTimeString()}] ${msg}`));
}

function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
  https.get(url, (res) => {
    res.on("data", () => {});
  }).on("error", (e) => {
    console.error(chalk.red("❌ Gagal kirim ke Telegram:"), e);
  });
}

// === Verifikasi contract ===
async function verifyWithRetry(address) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const spinner = ora(`🔍 Attempt verifikasi ke-${attempt}...`).start();
    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: [],
      });
      spinner.succeed("✅ Verifikasi berhasil!");
      return true;
    } catch (err) {
      spinner.fail(`❌ Gagal verifikasi (attempt ${attempt}): ${err.message || err}`);
      if (attempt === maxAttempts) {
        logInfo(chalk.red("🚫 Verifikasi gagal setelah 3 percobaan."));
        sendTelegramMessage(`❌ Verifikasi gagal setelah 3x!\nExplorer: https://sepolia.tea.xyz/address/${address}`);
        return false;
      }
      const delay = (Math.floor(Math.random() * 2) + 1) * 60 * 1000;
      logInfo(chalk.yellow(`⏳ Coba ulang verifikasi dalam ${(delay / 60000).toFixed(1)} menit...\n`));
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// === Deploy + Verifikasi ===
async function deployAndVerify() {
  logInfo("🚀 Deploying contract HokiReceh...");

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  if (balance < hre.ethers.parseEther("0.005")) {
    console.log(chalk.red("🚫 Wallet bokek! Saldo < 0.005 TEA"));
    sendTelegramMessage("🚫 Gagal deploy. Wallet bokek.");
    return false;
  }

  const spinner = ora("📦 Deploying...").start();
  try {
    const Contract = await hre.ethers.getContractFactory("HokiReceh");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    spinner.succeed(`✅ Contract deployed at: ${chalk.cyan(address)}`);
    logInfo("⏳ Menunggu 10 menit sebelum verifikasi...\n");
    await new Promise((res) => setTimeout(res, 10 * 60 * 1000));

    const verified = await verifyWithRetry(address);

    if (verified) {
      const msg = `
✅ *HokiReceh Deployed & Verified*

📦 [Alamat](https://sepolia.tea.xyz/address/${address})
🧠 [Explorer](https://sepolia.tea.xyz/address/${address}/contracts)

⚡ Farming ulang sebentar lagi...
      `.trim();
      sendTelegramMessage(msg);
    }

    return verified;
  } catch (err) {
    spinner.fail(`❌ Error deploy: ${err.message || err}`);
    sendTelegramMessage("❌ Error fatal saat deploy: " + (err.message || err));
    return false;
  }
}

// === Farming loop ===
async function loop() {
  while (true) {
    const success = await deployAndVerify();
    if (!success) {
      logInfo(chalk.yellow("⚠️ Skip farming ulang karena error/verifikasi gagal.\n"));
    }
    const nextDelay = (Math.random() * 2 + 1) * 60 * 1000;
    logInfo(`🕐 Delay ${(nextDelay / 60000).toFixed(1)} menit sebelum farming ulang...\n`);
    await new Promise((res) => setTimeout(res, nextDelay));
  }
}
