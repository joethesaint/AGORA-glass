import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("AGORA-glass Contracts", function () {
  async function deployFixture() {
    const [owner, agent, recipient] = await ethers.getSigners();

    // Mock USDC for testing (using a simple contract or just assuming success if we had a mock)
    // For this test, we'll focus on access control logic.
    
    const AttributionRegistry = await ethers.getContractFactory("AttributionRegistry");
    const registry = await AttributionRegistry.deploy();

    const Vault = await ethers.getContractFactory("Vault");
    // Using a random address for USDC in this test fixture
    const vault = await Vault.deploy(ethers.ZeroAddress, agent.address);

    return { registry, vault, owner, agent, recipient };
  }

  describe("AttributionRegistry", function () {
    it("Should store a reasoning hash", async function () {
      const { registry } = await loadFixture(deployFixture);
      const hash = ethers.id("test reasoning");
      
      await expect(registry.storeReason(hash))
        .to.emit(registry, "ReasonHashStored")
        .withArgs(hash, anyValue => true);
        
      expect(await registry.verifyReason(hash)).to.be.gt(0);
    });

    it("Should revert if hash already exists", async function () {
      const { registry } = await loadFixture(deployFixture);
      const hash = ethers.id("duplicate");
      await registry.storeReason(hash);
      await expect(registry.storeReason(hash)).to.be.revertedWith("Hash already exists");
    });
  });

  describe("Vault", function () {
    it("Should allow only the agent to release funds", async function () {
      const { vault, owner, recipient } = await loadFixture(deployFixture);
      const hash = ethers.id("rescue");
      
      // Attempt by owner (non-agent)
      await expect(vault.releaseForRescue(100, "arbitrum", recipient.address, hash))
        .to.be.revertedWith("Caller is not the authorized agent");
    });

    it("Should allow the owner to update the agent", async function () {
      const { vault, owner } = await loadFixture(deployFixture);
      const newAgent = ethers.Wallet.createRandom().address;
      
      await expect(vault.setAgent(newAgent))
        .to.emit(vault, "AgentUpdated")
        .withArgs(anyValue => true, newAgent);
        
      expect(await vault.agent()).to.equal(newAgent);
    });
  });
});
