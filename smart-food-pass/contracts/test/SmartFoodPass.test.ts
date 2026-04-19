import { expect } from "chai";
import hre from "hardhat";

describe("SmartFoodPass", function () {
  let contract: any;
  let owner: any;
  let sponsor: any;
  let merchant: any;
  let beneficiary: any;

  beforeEach(async function () {
    const SmartFoodPass = await hre.ethers.getContractFactory("SmartFoodPass");
    contract = await SmartFoodPass.deploy();

    [owner, sponsor, merchant, beneficiary] = await hre.ethers.getSigners();

    // Grant roles
    const SPONSOR_ROLE = await contract.SPONSOR_ROLE();
    const MERCHANT_ROLE = await contract.MERCHANT_ROLE();
    const ADMIN_ROLE = await contract.ADMIN_ROLE();

    await contract.grantRole(SPONSOR_ROLE, sponsor.address);
    await contract.grantRole(MERCHANT_ROLE, merchant.address);
    await contract.grantRole(ADMIN_ROLE, owner.address);
  });

  describe("Pass Management", function () {
    it("should issue a new pass", async function () {
      const value = hre.ethers.parseEther("10");

      const tx = await contract
        .connect(sponsor)
        .issuePass(beneficiary.address, value);

      expect(tx)
        .to.emit(contract, "PassIssued")
        .withArgs(1, beneficiary.address, sponsor.address, value);

      const pass = await contract.getPass(1);
      expect(pass.beneficiary).to.equal(beneficiary.address);
      expect(pass.value).to.equal(value);
    });

    it("should fund an existing pass", async function () {
      const value = hre.ethers.parseEther("10");
      await contract.connect(sponsor).issuePass(beneficiary.address, value);

      const fundAmount = hre.ethers.parseEther("5");
      await contract.connect(sponsor).fundPass(1, fundAmount);

      const pass = await contract.getPass(1);
      expect(pass.balance).to.equal(value + fundAmount);
    });
  });

  describe("Redemption", function () {
    it("should redeem a pass", async function () {
      const value = hre.ethers.parseEther("10");
      await contract.connect(sponsor).issuePass(beneficiary.address, value);

      const redeemAmount = hre.ethers.parseEther("3");
      await contract.validateMerchant(merchant.address);

      await contract
        .connect(merchant)
        .redeemPass(1, redeemAmount);

      const pass = await contract.getPass(1);
      expect(pass.balance).to.equal(value - redeemAmount);
    });

    it("should fail if merchant not approved", async function () {
      const value = hre.ethers.parseEther("10");
      await contract.connect(sponsor).issuePass(beneficiary.address, value);

      const redeemAmount = hre.ethers.parseEther("3");
      const unapprovedSigner = (await hre.ethers.getSigners())[4];

      await expect(
        contract.connect(unapprovedSigner).redeemPass(1, redeemAmount)
      ).to.be.revertedWith("Merchant not approved");
    });
  });

  describe("System Control", function () {
    it("should pause and resume system", async function () {
      await contract.pauseSystem();
      expect(await contract.systemPaused()).to.be.true;

      await contract.resumeSystem();
      expect(await contract.systemPaused()).to.be.false;
    });
  });
});
