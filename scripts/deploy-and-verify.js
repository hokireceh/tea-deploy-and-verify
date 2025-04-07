const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying contract HokiReceh...");

  const HokiReceh = await hre.ethers.getContractFactory("HokiReceh");
  const greeter = await HokiReceh.deploy();
  await greeter.waitForDeployment();

  const address = await greeter.getAddress();
  console.log("✅ Contract deployed at:", address);

  // Delay acak 5–10 menit sebelum verifikasi (biar block confirm dulu)
  const delayMs = (Math.floor(Math.random() * 6) + 5) * 60 * 1000;
  const delayMin = (delayMs / 60000).toFixed(1);
  console.log(`⏳ Menunggu ${delayMin} menit sebelum verifikasi...\n`);

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  try {
    console.log("🔍 Verifying on explorer...");
    await hre.run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (err) {
    console.error("❌ Gagal verifikasi:", err.message || err);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exitCode = 1;
});
