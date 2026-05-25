import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contracts with:", deployer.address);

  // Constants
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
  const AGENT_ADDRESS = deployer.address; // For testnet, agent is deployer initially

  // 1. Deploy AttributionRegistry
  const AttributionRegistry = await ethers.getContractFactory("AttributionRegistry");
  const registry = await AttributionRegistry.deploy(AGENT_ADDRESS);
  await registry.waitForDeployment();
  const regAddr = await registry.getAddress();
  console.log("✅ AttributionRegistry:", regAddr);

  // 2. Deploy Vault
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(USDC_ADDRESS, AGENT_ADDRESS);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("✅ Vault:", vaultAddr);

  // 3. Deploy BondEscrow
  const BondEscrow = await ethers.getContractFactory("BondEscrow");
  const bond = await BondEscrow.deploy(USDC_ADDRESS);
  await bond.waitForDeployment();
  const bondAddr = await bond.getAddress();
  console.log("✅ BondEscrow:", bondAddr);

  // Write deployment config
  const config = {
    AttributionRegistry: regAddr,
    Vault: vaultAddr,
    BondEscrow: bondAddr,
    USDC: USDC_ADDRESS,
    Agent: AGENT_ADDRESS
  };

  const configPath = path.join(__dirname, "../config/addresses.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("📝 Saved addresses to:", configPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
