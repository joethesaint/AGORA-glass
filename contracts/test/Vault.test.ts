import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("AGORA-glass Contracts", function () {
  async function deployFixture() {
    const [owner, agent, stranger, recipient] = await ethers.getSigners();

    const AttributionRegistry = await ethers.getContractFactory("AttributionRegistry");
    const registry = await AttributionRegistry.deploy(agent.address);

    const Vault = await ethers.getContractFactory("Vault");
    // Using a random address for USDC in this test fixture
    const vault = await Vault.deploy(ethers.ZeroAddress, agent.address);

    return { registry, vault, owner, agent, stranger, recipient };
  }

  describe("AttributionRegistry", function () {
    it("Should store a reasoning hash", async function () {
      const { registry, agent } = await loadFixture(deployFixture);
      const hash = ethers.id("test reasoning");
      
      await expect(registry.connect(agent).storeReason(hash))
        .to.emit(registry, "ReasonStored")
        .withArgs(agent.address, hash, anyValue => true);
        
      const trace = await registry.getTrace(hash);
      expect(trace.timestamp).to.be.gt(0);
    });

    it("Should revert if unauthorized", async function () {
      const { registry, stranger } = await loadFixture(deployFixture);
      const hash = ethers.id("unauthorized");
      await expect(registry.connect(stranger).storeReason(hash))
        .to.be.revertedWithCustomError(registry, "Unauthorized");
    });

    it("Should revert if hash already exists", async function () {
      const { registry, agent } = await loadFixture(deployFixture);
      const hash = ethers.id("duplicate");
      await registry.connect(agent).storeReason(hash);
      await expect(registry.connect(agent).storeReason(hash))
        .to.be.revertedWithCustomError(registry, "AlreadyStored");
    });
  });

  describe("Vault", function () {
    it("Should allow only the agent or owner to release funds", async function () {
      const { vault, stranger, recipient } = await loadFixture(deployFixture);
      const hash = ethers.id("rescue");
      
      // Attempt by stranger (neither agent nor owner)
      await expect(vault.connect(stranger).releaseForRescue(100, "arbitrum", recipient.address, hash))
        .to.be.revertedWithCustomError(vault, "Unauthorized");
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
