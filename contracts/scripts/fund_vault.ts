import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [funder] = await ethers.getSigners();
  
  // Load addresses
  const configPath = path.join(__dirname, "../config/addresses.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  
  const USDC_ADDRESS = config.USDC;
  const VAULT_ADDRESS = config.Vault;
  const amount = ethers.parseUnits("1000", 6); // 1000 USDC

  console.log(`💸 Funding Vault at ${VAULT_ADDRESS} with 1000 USDC...`);

  // Simple ERC20 ABI for transfer
  const erc20Abi = [
    "function transfer(address to, uint256 amount) external returns (bool)"
  ];
  const usdc = new ethers.Contract(USDC_ADDRESS, erc20Abi, funder);
  
  const tx = await usdc.transfer(VAULT_ADDRESS, amount);
  await tx.wait();
  
  console.log("✅ Vault funded successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
