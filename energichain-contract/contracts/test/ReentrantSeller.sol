// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEnergyOffer {
    function createOffer(bytes32 userHash, uint256 price) external;
    function acceptOffer(uint256 id) external payable;
}

/// @dev Test-only recipient used to verify that settlement cannot re-enter.
contract ReentrantSeller {
    IEnergyOffer public immutable marketplace;
    uint256 public reentryOfferId;
    uint256 public reentryPrice;
    bool public reentrySucceeded;

    constructor(address marketplaceAddress) {
        marketplace = IEnergyOffer(marketplaceAddress);
    }

    function createOffer(bytes32 userHash, uint256 price) external {
        marketplace.createOffer(userHash, price);
    }

    function configureReentry(uint256 offerId, uint256 price) external {
        reentryOfferId = offerId;
        reentryPrice = price;
    }

    receive() external payable {
        (bool success, ) = address(marketplace).call{value: reentryPrice}(
            abi.encodeWithSelector(IEnergyOffer.acceptOffer.selector, reentryOfferId)
        );
        reentrySucceeded = success;
    }
}
