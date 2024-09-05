// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Types} from "../libraries/Types.sol";

interface ISubscriptionManager {
    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed serviceProvider,
        string serviceName,
        uint256 amount,
        uint256 interval
    );
    event SubscriptionUpdated(
        uint256 indexed subscriptionId,
        address indexed serviceProvider,
        string newServiceName,
        uint256 newAmount,
        uint256 newInterval
    );
    event SubscriptionEnabled(
        uint256 indexed subscriptionId,
        address indexed serviceProvider
    );
    event SubscriptionDisabled(
        uint256 indexed subscriptionId,
        address indexed serviceProvider
    );

    event SubscriptionSubscribed(
        uint256 indexed subscriptionId,
        address indexed subscriber
    );
    event SubscriptionUnsubscribed(
        uint256 indexed subscriptionId,
        address indexed subscriber
    );

    event PaymentInitiated(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed serviceProvider,
        uint256 amount
    );
    event PaymentFinished(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed serviceProvider,
        uint256 amount
    );

    event MessageSent(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed serviceProvider,
        uint256 amount,
        uint32 dstEid
    );
    event MessageReceived(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        uint32 senderEid,
        bytes32 sender,
        uint64 nonce
    );

    error SubscriptionManager_EmptyString();
    error SubscriptionManager_ZeroAmount();
    error SubscriptionManager_ZeroInterval();
    error SubscriptionManager_OnlyServiceProvider();
    error SubscriptionManager_NotServiceProvider();
    error SubscriptionManager_OnlySubcriber();
    error SubscriptionManager_ActiveSubscription();
    error SubscriptionManager_InactiveSubscription();
    error SubscriptionManager_PaymentNotDueYet();
}
