// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ISubscriptionManager {
    event SubscriptionCreated(
        uint256 subscriptionId,
        address user,
        address serviceProvider,
        uint256 amount,
        uint256 interval,
        uint256 nextPaymentDate
    );
    event PaymentInitiated(
        uint256 subscriptionId,
        address user,
        address serviceProvider,
        uint256 amount
    );
    event PaymentFinished(uint256 subscriptionId, uint256 nextPaymentDate);
    event MessageSent(
        uint256 subscriptionId,
        address user,
        address serviceProvider,
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
