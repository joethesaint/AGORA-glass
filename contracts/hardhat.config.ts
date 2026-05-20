import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    arcTestnet: {
      url: process.env.RPC || "https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_42b1f431a6cfa6a62d2c14e6c91d2c39545bc99bb8ee5c241f85f8108a4af369",
      chainId: 5042002,
      accounts: process.env.AGENT_PRIVATE_KEY ? [process.env.AGENT_PRIVATE_KEY] : [],
    },
  },
};

export default config;
