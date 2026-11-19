const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("EnergyOffer", function () {
  const price = ethers.parseEther("0.01");
  const sellerHash = ethers.keccak256(ethers.toUtf8Bytes("seller@example.com"));

  async function deployOfferFixture() {
    const [seller, buyer, other, attackerController] = await ethers.getSigners();
    const EnergyOffer = await ethers.getContractFactory("EnergyOffer");
    const energyOffer = await EnergyOffer.deploy();

    return { energyOffer, seller, buyer, other, attackerController };
  }

  it("deploys with the intended minimum price and an empty offer list", async function () {
    const { energyOffer } = await deployOfferFixture();
    expect(await energyOffer.MIN_PRICE()).to.equal(price);
    expect(await energyOffer.getOfferCount()).to.equal(0);
  });

  it("creates an active offer and records its owner", async function () {
    const { energyOffer, seller } = await deployOfferFixture();

    await expect(energyOffer.connect(seller).createOffer(sellerHash, price))
      .to.emit(energyOffer, "OfferCreated")
      .withArgs(0, sellerHash, price, anyValue);

    const offer = await energyOffer.getOffer(0);
    expect(offer.userHash).to.equal(sellerHash);
    expect(offer.price).to.equal(price);
    expect(offer.active).to.equal(true);
    expect(await energyOffer.getOwnerAddress(0)).to.equal(seller.address);
    expect(await energyOffer.getActiveUserOfferIds(sellerHash)).to.deep.equal([0n]);
  });

  it("rejects an offer below the configured minimum price", async function () {
    const { energyOffer, seller } = await deployOfferFixture();

    await expect(
      energyOffer.connect(seller).createOffer(sellerHash, price - 1n)
    ).to.be.revertedWith("Price below minimum");
  });

  it("allows only the owner to cancel an active offer", async function () {
    const { energyOffer, seller, other } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(sellerHash, price);

    await expect(energyOffer.connect(other).cancelOffer(0)).to.be.revertedWith(
      "Not offer owner"
    );
    await expect(energyOffer.connect(seller).cancelOffer(0))
      .to.emit(energyOffer, "OfferCancelled")
      .withArgs(0, sellerHash);

    expect((await energyOffer.getOffer(0)).active).to.equal(false);
    await expect(energyOffer.connect(seller).cancelOffer(0)).to.be.revertedWith(
      "Offer already inactive"
    );
  });

  it("rejects self-purchase, incorrect payment, and invalid offer IDs", async function () {
    const { energyOffer, seller, buyer } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(sellerHash, price);

    await expect(energyOffer.connect(seller).acceptOffer(0, { value: price }))
      .to.be.revertedWith("Cannot accept own offer");
    await expect(energyOffer.connect(buyer).acceptOffer(0, { value: price - 1n }))
      .to.be.revertedWith("Incorrect payment");
    await expect(energyOffer.connect(buyer).acceptOffer(1, { value: price }))
      .to.be.revertedWith("Invalid offer ID");
  });

  it("settles a correctly funded offer, transfers payment, emits, and deactivates it", async function () {
    const { energyOffer, seller, buyer } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(sellerHash, price);

    await expect(
      energyOffer.connect(buyer).acceptOffer(0, { value: price })
    )
      .to.changeEtherBalances([seller, buyer], [price, -price]);

    expect((await energyOffer.getOffer(0)).active).to.equal(false);
    await expect(energyOffer.connect(buyer).acceptOffer(0, { value: price }))
      .to.be.revertedWith("Offer not active");
  });

  it("emits the acceptance event with the buyer and price", async function () {
    const { energyOffer, seller, buyer } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(sellerHash, price);

    await expect(energyOffer.connect(buyer).acceptOffer(0, { value: price }))
      .to.emit(energyOffer, "OfferAccepted")
      .withArgs(0, buyer.address, sellerHash, price, anyValue);
  });

  it("prevents settlement reentrancy from a payment recipient", async function () {
    const { energyOffer, seller, buyer, attackerController } = await deployOfferFixture();
    const ReentrantSeller = await ethers.getContractFactory("ReentrantSeller");
    const reentrantSeller = await ReentrantSeller.connect(attackerController).deploy(energyOffer.target);

    // Offer 0 is a separate seller's offer. During payment for offer 1, the
    // receiving contract attempts to buy it with the payment it just received.
    await energyOffer.connect(seller).createOffer(sellerHash, price);
    await reentrantSeller.createOffer(sellerHash, price);
    await reentrantSeller.configureReentry(0, price);

    await energyOffer.connect(buyer).acceptOffer(1, { value: price });

    expect(await reentrantSeller.reentrySucceeded()).to.equal(false);
    expect((await energyOffer.getOffer(0)).active).to.equal(true);
    expect((await energyOffer.getOffer(1)).active).to.equal(false);
  });
});
