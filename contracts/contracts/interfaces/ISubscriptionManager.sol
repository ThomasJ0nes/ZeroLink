// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Types} from "../libraries/Types.sol";

interface ISubscriptionManager {
    event SubscriptionCreated(
        uint256 subscriptionId,
        address provider,
        string name,
        uint256 amount,
        uint256 interval
    );
    event SubscriptionUpdated(
        uint256 subscriptionId,
        address provider,
        string newName,
        uint256 newAmount,
        uint256 newInterval
    );

    event SubscriptionSubscribed(uint256 subscriptionId, address subscriber);
    event SubscriptionUnsubscribed(uint256 subscriptionId, address subscriber);

    event PaymentInitiated(
        uint256 subscriptionId,
        address subscriber,
        address provider,
        uint256 amount
    );
    event PaymentFinished(
        uint256 subscriptionId,
        address subscriber,
        address provider,
        uint256 amount
    );

    event MessageSent(
        uint256 subscriptionId,
        address subscriber,
        address provider,
        uint256 amount,
        uint32 dstEid
    );
    event MessageReceived(
        uint256 subscriptionId,
        address subscriber,
        uint32 senderEid,
        bytes32 sender,
        uint64 nonce
    );

    error SubscriptionManager_EmptyName();
    error SubscriptionManager_ZeroAmount();
    error SubscriptionManager_ZeroInterval();
    error SubscriptionManager_OnlyProvider();
    error SubscriptionManager_NotProvider();
    error SubscriptionManager_AlreadySubscribed();
    error SubscriptionManager_OnlySubcriber();
    error SubscriptionManager_PaymentNotDueYet();
}
