import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contracts with the account:", deployer.address);

  // 1. Deploy AttributionRegistry
  const AttributionRegistry = await ethers.getContractFactory("AttributionRegistry");
  const registry = await AttributionRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ AttributionRegistry deployed to:", registryAddress);

  // 2. Deploy Vault
  // USDC address on Arc Testnet (ERC-20 interface)
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
  // The Agent address (initially the deployer for testing)
  const AGENT_ADDRESS = deployer.address; 

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(USDC_ADDRESS, AGENT_ADDRESS);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ Vault deployed to:", vaultAddress);

  console.log("\n📝 Deployment Summary:");
  console.log(JSON.stringify({
    AttributionRegistry: registryAddress,
    Vault: vaultAddress,
    USDC: USDC_ADDRESS,
    Agent: AGENT_ADDRESS
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
