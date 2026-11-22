// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEnergyOffer {
    function createOffer(uint256 energyKwh, uint256 priceWei, uint256 deliveryWindow) external returns (uint256);
    function acceptOffer(uint256 id) external payable;
    function confirmDelivery(uint256 id) external;
    function claimTimeoutPayment(uint256 id) external;
}

/// @dev Test-only recipient used to verify that escrow settlement cannot re-enter.
contract ReentrantSeller {
    IEnergyOffer public immutable marketplace;
    uint256 public targetOfferId;
    uint256 public reentryPrice;
    bool public reentrySucceeded;

    constructor(address marketplaceAddress) {
        marketplace = IEnergyOffer(marketplaceAddress);
    }

    function createOffer(uint256 energyKwh, uint256 priceWei, uint256 deliveryWindow) external returns (uint256) {
        return marketplace.createOffer(energyKwh, priceWei, deliveryWindow);
    }

    function configureReentry(uint256 offerId, uint256 price) external {
        targetOfferId = offerId;
        reentryPrice = price;
    }

    receive() external payable {
        // Attempt reentrancy into acceptOffer while receiving payout
        (bool success, ) = address(marketplace).call{value: reentryPrice}(
            abi.encodeWithSelector(IEnergyOffer.acceptOffer.selector, targetOfferId)
        );
        reentrySucceeded = success;
    }
}
