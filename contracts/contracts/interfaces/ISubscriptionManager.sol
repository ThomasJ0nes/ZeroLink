// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Types} from "../libraries/Types.sol";

interface ISubscriptionManager {
    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address serviceProvider,
        string serviceName,
        uint256 amount,
        uint256 interval
    );
    event PaymentInitiated(
        uint256 indexed subscriptionId,
        address user,
        address serviceProviderAddress,
        uint256 amount
    );
    event PaymentFinished(
        uint256 indexed subscriptionId,
        address user,
        address serviceProviderAddress,
        uint256 amount
    );
    event SubscriptionCanceled(uint256 indexed subscriptionId);
    event MessageSent(
        uint256 subscriptionId,
        address user,
        address serviceProviderAddress,
        uint256 amount,
        uint32 dstEid
    );
    event MessageReceived(
        uint256 subscriptionId,
        uint32 senderEid,
        bytes32 sender,
        uint64 nonce
    );

    error SubscriptionManager_LowAmount();
    error SubscriptionManager_LowInterval();
    error SubscriptionManager_OnlySubcriber();
    error SubscriptionManager_PaymentNotDueYet();
}
