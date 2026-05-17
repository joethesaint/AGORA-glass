import { ethers } from "hardhat";

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("ADDRESS:", wallet.address);
  console.log("PRIVATE_KEY:", wallet.privateKey);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
