const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EnergyOffer (Escrow State Machine)", function () {
  const energyKwh = 100n;
  const priceWei = ethers.parseEther("0.05");

  async function deployOfferFixture() {
    const [seller, buyer, other, attackerController] = await ethers.getSigners();
    const EnergyOffer = await ethers.getContractFactory("EnergyOffer");
    const energyOffer = await EnergyOffer.deploy();

    const latestTime = BigInt(await time.latest());
    const deliveryWindow = latestTime + 86400n; // 1 day in the future

    return { energyOffer, seller, buyer, other, attackerController, deliveryWindow };
  }

  // ---------------------------------------------------------------------------
  // 1. Deployment
  // ---------------------------------------------------------------------------
  it("deploys with an empty offer list and zero initial offers", async function () {
    const { energyOffer } = await deployOfferFixture();
    expect(await energyOffer.getOfferCount()).to.equal(0n);
    expect((await energyOffer.getActiveOffers()).length).to.equal(0);
  });

  // ---------------------------------------------------------------------------
  // 2. Offer Creation
  // ---------------------------------------------------------------------------
  it("creates an open offer with quantity, price, and delivery window, deriving seller from msg.sender", async function () {
    const { energyOffer, seller, deliveryWindow } = await deployOfferFixture();

    await expect(
      energyOffer.connect(seller).createOffer(energyKwh, priceWei, deliveryWindow)
    )
      .to.emit(energyOffer, "OfferCreated")
      .withArgs(0n, seller.address, energyKwh, priceWei, deliveryWindow, anyValue);

    expect(await energyOffer.getOfferCount()).to.equal(1n);

    const offer = await energyOffer.getOffer(0);
    expect(offer.seller).to.equal(seller.address);
    expect(offer.buyer).to.equal(ethers.ZeroAddress);
    expect(offer.energyKwh).to.equal(energyKwh);
    expect(offer.priceWei).to.equal(priceWei);
    expect(offer.deliveryWindow).to.equal(deliveryWindow);
    expect(offer.state).to.equal(0n); // OfferState.Open
    expect(offer.sellerFulfilled).to.equal(false);

    expect(await energyOffer.getOwnerAddress(0)).to.equal(seller.address);
    expect(await energyOffer.getActiveOffers()).to.deep.equal([0n]);
  });

  it("rejects zero quantity, zero price, past delivery window, and excessive delivery window", async function () {
    const { energyOffer, seller, deliveryWindow } = await deployOfferFixture();
    const currentTime = BigInt(await time.latest());

    // 0 quantity
    await expect(
      energyOffer.connect(seller).createOffer(0n, priceWei, deliveryWindow)
    ).to.be.revertedWith("Energy quantity must be positive");

    // 0 price
    await expect(
      energyOffer.connect(seller).createOffer(energyKwh, 0n, deliveryWindow)
    ).to.be.revertedWith("Price must be positive");

    // Past delivery window
    await expect(
      energyOffer.connect(seller).createOffer(energyKwh, priceWei, currentTime - 10n)
    ).to.be.revertedWith("Delivery window must be in the future");

    // Delivery window exceeds 30 days
    const tooFarFuture = currentTime + (31n * 86400n);
    await expect(
      energyOffer.connect(seller).createOffer(energyKwh, priceWei, tooFarFuture)
    ).to.be.revertedWith("Delivery window exceeds maximum permitted duration");
  });

  // ---------------------------------------------------------------------------
  // 3. Offer Cancellation
  // ---------------------------------------------------------------------------
  it("allows only the seller to cancel an open offer and emits OfferCancelled", async function () {
    const { energyOffer, seller, other, deliveryWindow } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(energyKwh, priceWei, deliveryWindow);

    // Non-owner cannot cancel
    await expect(
      energyOffer.connect(other).cancelOffer(0)
    ).to.be.revertedWith("Not offer seller");

    // Seller cancels
    await expect(energyOffer.connect(seller).cancelOffer(0))
      .to.emit(energyOffer, "OfferCancelled")
      .withArgs(0n, seller.address);

    const offer = await energyOffer.getOffer(0);
    expect(offer.state).to.equal(4n); // OfferState.Cancelled
    expect((await energyOffer.getActiveOffers()).length).to.equal(0);

    // Cannot cancel again
    await expect(
      energyOffer.connect(seller).cancelOffer(0)
    ).to.be.revertedWith("Offer not open for cancellation");
  });

  // ---------------------------------------------------------------------------
  // 4. Offer Acceptance (Escrow Lock)
  // ---------------------------------------------------------------------------
  it("rejects self-purchase, incorrect payment, invalid IDs, and expired delivery window", async function () {
    const { energyOffer, seller, buyer, deliveryWindow } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(energyKwh, priceWei, deliveryWindow);

    // Self purchase
    await expect(
      energyOffer.connect(seller).acceptOffer(0, { value: priceWei })
    ).to.be.revertedWith("Cannot accept own offer");

    // Incorrect payment
    await expect(
      energyOffer.connect(buyer).acceptOffer(0, { value: priceWei - 1n })
    ).to.be.revertedWith("Incorrect payment amount");

    // Invalid offer ID
    await expect(
      energyOffer.connect(buyer).acceptOffer(999, { value: priceWei })
    ).to.be.revertedWith("Invalid offer ID");

    // Expired delivery window
    await time.increaseTo(deliveryWindow + 10n);
    await expect(
      energyOffer.connect(buyer).acceptOffer(0, { value: priceWei })
    ).to.be.revertedWith("Delivery window has expired");
  });

  it("locks exact buyer funds into escrow (not sent to seller yet) and emits OfferLocked", async function () {
    const { energyOffer, seller, buyer, deliveryWindow } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(energyKwh, priceWei, deliveryWindow);

    // Initial seller balance
    const sellerBalBefore = await ethers.provider.getBalance(seller.address);

    // Buyer accepts: funds transfer to CONTRACT, not seller
    await expect(
      energyOffer.connect(buyer).acceptOffer(0, { value: priceWei })
    )
      .to.emit(energyOffer, "OfferLocked")
      .withArgs(0n, buyer.address, seller.address, priceWei, deliveryWindow);

    // Verify contract holds the escrowed funds
    expect(await ethers.provider.getBalance(energyOffer.target)).to.equal(priceWei);

    // Seller received 0 funds at this stage
    const sellerBalAfter = await ethers.provider.getBalance(seller.address);
    expect(sellerBalAfter).to.equal(sellerBalBefore);

    const offer = await energyOffer.getOffer(0);
    expect(offer.state).to.equal(1n); // OfferState.Locked
    expect(offer.buyer).to.equal(buyer.address);

    // Cannot accept again (double-accept protection)
    await expect(
      energyOffer.connect(buyer).acceptOffer(0, { value: priceWei })
    ).to.be.revertedWith("Offer not open");
  });

  // ---------------------------------------------------------------------------
  // 5. Buyer Delivery Confirmation (Happy Path Escrow Release)
  // ---------------------------------------------------------------------------
  it("buyer confirms delivery, releasing escrowed funds to seller", async function () {
    const { energyOffer, seller, buyer, other, deliveryWindow } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(energyKwh, priceWei, deliveryWindow);
    await energyOffer.connect(buyer).acceptOffer(0, { value: priceWei });

    // Unauthorized non-buyer cannot confirm
    await expect(
      energyOffer.connect(other).confirmDelivery(0)
    ).to.be.revertedWith("Only buyer can confirm delivery");
    await expect(
      energyOffer.connect(seller).confirmDelivery(0)
    ).to.be.revertedWith("Only buyer can confirm delivery");

    // Buyer confirms delivery -> seller receives payment
    await expect(
      energyOffer.connect(buyer).confirmDelivery(0)
    )
      .to.emit(energyOffer, "DeliveryConfirmed")
      .withArgs(0n, buyer.address, seller.address, priceWei);

    const offer = await energyOffer.getOffer(0);
    expect(offer.state).to.equal(2n); // OfferState.Delivered
  });

  // ---------------------------------------------------------------------------
  // 6. Seller Timeout Claim
  // ---------------------------------------------------------------------------
  it("allows seller to claim payment after delivery window and grace period timeout", async function () {
    const { energyOffer, seller, buyer, other, deliveryWindow } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(energyKwh, priceWei, deliveryWindow);
    await energyOffer.connect(buyer).acceptOffer(0, { value: priceWei });

    // Seller marks physical delivery
    await expect(energyOffer.connect(seller).markFulfilled(0))
      .to.emit(energyOffer, "DeliveryMarked")
      .withArgs(0n, seller.address);

    // Before grace period expires, seller cannot claim
    await expect(
      energyOffer.connect(seller).claimTimeoutPayment(0)
    ).to.be.revertedWith("Grace period has not expired");

    // Advance time past deliveryWindow + GRACE_PERIOD (3 days)
    const gracePeriod = await energyOffer.GRACE_PERIOD();
    await time.increaseTo(deliveryWindow + gracePeriod + 10n);

    // Unauthorized account cannot claim
    await expect(
      energyOffer.connect(other).claimTimeoutPayment(0)
    ).to.be.revertedWith("Only seller can claim timeout payment");

    // Seller claims payment
    await expect(
      energyOffer.connect(seller).claimTimeoutPayment(0)
    )
      .to.emit(energyOffer, "TimeoutPaymentClaimed")
      .withArgs(0n, seller.address, priceWei);

    const offer = await energyOffer.getOffer(0);
    expect(offer.state).to.equal(2n); // OfferState.Delivered
  });

  // ---------------------------------------------------------------------------
  // 7. Buyer Refund Claim
  // ---------------------------------------------------------------------------
  it("allows buyer to claim full refund if seller fails to mark delivery fulfilled", async function () {
    const { energyOffer, seller, buyer, other, deliveryWindow } = await deployOfferFixture();
    await energyOffer.connect(seller).createOffer(energyKwh, priceWei, deliveryWindow);
    await energyOffer.connect(buyer).acceptOffer(0, { value: priceWei });

    // During active delivery window, buyer cannot claim refund yet
    await expect(
      energyOffer.connect(buyer).claimRefund(0)
    ).to.be.revertedWith("Delivery window still active");

    // Advance time past delivery window (seller never called markFulfilled)
    await time.increaseTo(deliveryWindow + 1n);

    // Unauthorized account cannot claim refund
    await expect(
      energyOffer.connect(other).claimRefund(0)
    ).to.be.revertedWith("Only buyer can claim refund");

    // Buyer claims refund
    await expect(
      energyOffer.connect(buyer).claimRefund(0)
    )
      .to.emit(energyOffer, "RefundClaimed")
      .withArgs(0n, buyer.address, priceWei);

    const offer = await energyOffer.getOffer(0);
    expect(offer.state).to.equal(3n); // OfferState.Refunded
  });

  // ---------------------------------------------------------------------------
  // 8. Reentrancy Protection
  // ---------------------------------------------------------------------------
  it("prevents settlement reentrancy from a payment recipient during escrow release", async function () {
    const { energyOffer, seller, buyer, attackerController, deliveryWindow } = await deployOfferFixture();
    const ReentrantSeller = await ethers.getContractFactory("ReentrantSeller");
    const reentrantSeller = await ReentrantSeller.connect(attackerController).deploy(energyOffer.target);

    // Normal seller creates offer 0
    await energyOffer.connect(seller).createOffer(energyKwh, priceWei, deliveryWindow);

    // Attacker contract creates offer 1
    await reentrantSeller.createOffer(energyKwh, priceWei, deliveryWindow);
    // Configure attacker to attempt reentrant acceptOffer on offer 0 upon receiving funds
    await reentrantSeller.configureReentry(0, priceWei);

    // Buyer accepts attacker's offer 1 (funds locked in escrow)
    await energyOffer.connect(buyer).acceptOffer(1, { value: priceWei });

    // Buyer confirms delivery on offer 1, releasing payment to attacker contract
    await energyOffer.connect(buyer).confirmDelivery(1);

    // Reentrant call failed due to reentrancy protection and checks-effects
    expect(await reentrantSeller.reentrySucceeded()).to.equal(false);
    expect((await energyOffer.getOffer(0)).state).to.equal(0n); // Offer 0 remains Open
    expect((await energyOffer.getOffer(1)).state).to.equal(2n); // Offer 1 Delivered
  });
});
