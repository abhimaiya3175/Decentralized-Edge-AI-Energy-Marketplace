// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EnergyOffer
 * @dev Peer-to-peer renewable energy trading escrow contract with explicit state machine.
 * States:
 *   0 = Open: Created by seller with quantity (kWh), price (Wei), and delivery window.
 *   1 = Locked: Buyer deposited exact payment into escrow; funds held by contract.
 *   2 = Delivered: Buyer confirmed delivery (or seller claimed timeout), funds released to seller.
 *   3 = Refunded: Seller failed to fulfil; buyer reclaimed full payment from escrow.
 *   4 = Cancelled: Seller cancelled an open listing before any buyer locked funds.
 */
contract EnergyOffer {
    enum OfferState {
        Open,
        Locked,
        Delivered,
        Refunded,
        Cancelled
    }

    struct Offer {
        address seller;
        address buyer;
        uint256 energyKwh;       // Energy quantity in kWh
        uint256 priceWei;        // Total price in Wei
        uint256 deliveryWindow;  // Unix timestamp deadline for physical delivery
        uint256 createdAt;       // Offer publication timestamp
        OfferState state;        // Current state machine status
        bool sellerFulfilled;    // Whether seller marked delivery as complete
    }

    uint256 public constant GRACE_PERIOD = 3 days;
    uint256 public constant MAX_DELIVERY_WINDOW = 30 days;

    Offer[] public offers;
    mapping(address => uint256[]) public sellerOffers;

    // Reentrancy guard
    uint256 private _reentrancyStatus = 1;

    modifier nonReentrant() {
        require(_reentrancyStatus == 1, "ReentrancyGuard: reentrant call");
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }

    // Events for all state machine transitions
    event OfferCreated(
        uint256 indexed offerId,
        address indexed seller,
        uint256 energyKwh,
        uint256 priceWei,
        uint256 deliveryWindow,
        uint256 createdAt
    );

    event OfferCancelled(
        uint256 indexed offerId,
        address indexed seller
    );

    event OfferLocked(
        uint256 indexed offerId,
        address indexed buyer,
        address indexed seller,
        uint256 priceWei,
        uint256 deliveryWindow
    );

    event DeliveryMarked(
        uint256 indexed offerId,
        address indexed seller
    );

    event DeliveryConfirmed(
        uint256 indexed offerId,
        address indexed buyer,
        address indexed seller,
        uint256 priceWei
    );

    event TimeoutPaymentClaimed(
        uint256 indexed offerId,
        address indexed seller,
        uint256 priceWei
    );

    event RefundClaimed(
        uint256 indexed offerId,
        address indexed buyer,
        uint256 priceWei
    );

    /**
     * @dev Create an on-chain energy listing with quantity, price, and delivery window.
     * Seller is strictly msg.sender (no spoofable userHash parameter).
     */
    function createOffer(
        uint256 energyKwh,
        uint256 priceWei,
        uint256 deliveryWindow
    ) external returns (uint256) {
        require(energyKwh > 0, "Energy quantity must be positive");
        require(priceWei > 0, "Price must be positive");
        require(deliveryWindow > block.timestamp, "Delivery window must be in the future");
        require(
            deliveryWindow <= block.timestamp + MAX_DELIVERY_WINDOW,
            "Delivery window exceeds maximum permitted duration"
        );

        uint256 offerId = offers.length;
        offers.push(
            Offer({
                seller: msg.sender,
                buyer: address(0),
                energyKwh: energyKwh,
                priceWei: priceWei,
                deliveryWindow: deliveryWindow,
                createdAt: block.timestamp,
                state: OfferState.Open,
                sellerFulfilled: false
            })
        );

        sellerOffers[msg.sender].push(offerId);

        emit OfferCreated(
            offerId,
            msg.sender,
            energyKwh,
            priceWei,
            deliveryWindow,
            block.timestamp
        );

        return offerId;
    }

    /**
     * @dev Seller cancels an open offer before any buyer locks funds.
     */
    function cancelOffer(uint256 offerId) external {
        require(offerId < offers.length, "Invalid offer ID");
        Offer storage offer = offers[offerId];
        require(offer.seller == msg.sender, "Not offer seller");
        require(offer.state == OfferState.Open, "Offer not open for cancellation");

        offer.state = OfferState.Cancelled;
        emit OfferCancelled(offerId, msg.sender);
    }

    /**
     * @dev Buyer locks exact payment into escrow. Funds are held in contract.
     */
    function acceptOffer(uint256 offerId) external payable nonReentrant {
        require(offerId < offers.length, "Invalid offer ID");
        Offer storage offer = offers[offerId];

        require(offer.state == OfferState.Open, "Offer not open");
        require(msg.sender != offer.seller, "Cannot accept own offer");
        require(msg.value == offer.priceWei, "Incorrect payment amount");
        require(block.timestamp < offer.deliveryWindow, "Delivery window has expired");

        offer.buyer = msg.sender;
        offer.state = OfferState.Locked;

        emit OfferLocked(
            offerId,
            msg.sender,
            offer.seller,
            offer.priceWei,
            offer.deliveryWindow
        );
    }

    /**
     * @dev Seller marks physical energy delivery as completed.
     */
    function markFulfilled(uint256 offerId) external {
        require(offerId < offers.length, "Invalid offer ID");
        Offer storage offer = offers[offerId];

        require(offer.state == OfferState.Locked, "Offer not in locked state");
        require(msg.sender == offer.seller, "Only seller can mark delivery");
        require(!offer.sellerFulfilled, "Delivery already marked fulfilled");

        offer.sellerFulfilled = true;
        emit DeliveryMarked(offerId, msg.sender);
    }

    /**
     * @dev Buyer confirms delivery, releasing escrowed funds to seller.
     */
    function confirmDelivery(uint256 offerId) external nonReentrant {
        require(offerId < offers.length, "Invalid offer ID");
        Offer storage offer = offers[offerId];

        require(offer.state == OfferState.Locked, "Offer not in locked state");
        require(msg.sender == offer.buyer, "Only buyer can confirm delivery");

        offer.state = OfferState.Delivered;
        uint256 payout = offer.priceWei;

        // Checks-effects-interactions
        (bool success, ) = payable(offer.seller).call{value: payout}("");
        require(success, "Payment transfer to seller failed");

        emit DeliveryConfirmed(offerId, offer.buyer, offer.seller, payout);
    }

    /**
     * @dev Seller claims payment if delivery was marked and buyer did not confirm within grace period.
     */
    function claimTimeoutPayment(uint256 offerId) external nonReentrant {
        require(offerId < offers.length, "Invalid offer ID");
        Offer storage offer = offers[offerId];

        require(offer.state == OfferState.Locked, "Offer not in locked state");
        require(msg.sender == offer.seller, "Only seller can claim timeout payment");
        require(offer.sellerFulfilled, "Seller has not marked delivery fulfilled");
        require(
            block.timestamp > offer.deliveryWindow + GRACE_PERIOD,
            "Grace period has not expired"
        );

        offer.state = OfferState.Delivered;
        uint256 payout = offer.priceWei;

        (bool success, ) = payable(offer.seller).call{value: payout}("");
        require(success, "Payment transfer to seller failed");

        emit TimeoutPaymentClaimed(offerId, offer.seller, payout);
    }

    /**
     * @dev Buyer reclaims full refund from escrow if seller failed to mark delivery within delivery window.
     */
    function claimRefund(uint256 offerId) external nonReentrant {
        require(offerId < offers.length, "Invalid offer ID");
        Offer storage offer = offers[offerId];

        require(offer.state == OfferState.Locked, "Offer not in locked state");
        require(msg.sender == offer.buyer, "Only buyer can claim refund");
        require(!offer.sellerFulfilled, "Seller marked delivery; dispute timeout pending");
        require(block.timestamp >= offer.deliveryWindow, "Delivery window still active");

        offer.state = OfferState.Refunded;
        uint256 refundAmount = offer.priceWei;

        (bool success, ) = payable(offer.buyer).call{value: refundAmount}("");
        require(success, "Refund transfer to buyer failed");

        emit RefundClaimed(offerId, offer.buyer, refundAmount);
    }

    // =========================================================================
    // View Functions & Compatibility Getters
    // =========================================================================

    function getOfferCount() external view returns (uint256) {
        return offers.length;
    }

    function getOffer(uint256 offerId)
        external
        view
        returns (
            address seller,
            address buyer,
            uint256 energyKwh,
            uint256 priceWei,
            uint256 deliveryWindow,
            uint256 createdAt,
            OfferState state,
            bool sellerFulfilled
        )
    {
        require(offerId < offers.length, "Invalid offer ID");
        Offer memory o = offers[offerId];
        return (
            o.seller,
            o.buyer,
            o.energyKwh,
            o.priceWei,
            o.deliveryWindow,
            o.createdAt,
            o.state,
            o.sellerFulfilled
        );
    }

    function getOwnerAddress(uint256 offerId) external view returns (address) {
        require(offerId < offers.length, "Invalid offer ID");
        return offers[offerId].seller;
    }

    function getActiveOffers() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].state == OfferState.Open) {
                count++;
            }
        }
        uint256[] memory active = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < offers.length; i++) {
            if (offers[i].state == OfferState.Open) {
                active[idx] = i;
                idx++;
            }
        }
        return active;
    }
}
