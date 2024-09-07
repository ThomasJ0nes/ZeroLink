// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Types} from "../libraries/Types.sol";

interface ISubscriptionManager {
    event SubscriptionCreated(
<<<<<<< HEAD
        uint256 indexed subscriptionId,
        address indexed provider,
=======
        uint256 subscriptionId,
        address provider,
>>>>>>> origin/contracts
        string name,
        uint256 amount,
        uint256 interval
    );
    event SubscriptionUpdated(
<<<<<<< HEAD
        uint256 indexed subscriptionId,
        address indexed provider,
=======
        uint256 subscriptionId,
        address provider,
>>>>>>> origin/contracts
        string newName,
        uint256 newAmount,
        uint256 newInterval
    );

<<<<<<< HEAD
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
        address indexed provider,
        uint256 amount
    );
    event PaymentFinished(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed provider,
=======
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
>>>>>>> origin/contracts
        uint256 amount
    );

    event MessageSent(
<<<<<<< HEAD
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed provider,
=======
        uint256 subscriptionId,
        address subscriber,
        address provider,
>>>>>>> origin/contracts
        uint256 amount,
        uint32 dstEid
    );
    event MessageReceived(
<<<<<<< HEAD
        uint256 indexed subscriptionId,
        address indexed subscriber,
=======
        uint256 subscriptionId,
        address subscriber,
>>>>>>> origin/contracts
        uint32 senderEid,
        bytes32 sender,
        uint64 nonce
    );

    error SubscriptionManager_EmptyName();
    error SubscriptionManager_ZeroAmount();
    error SubscriptionManager_ZeroInterval();
    error SubscriptionManager_OnlyProvider();
    error SubscriptionManager_NotProvider();
    error SubscriptionManager_OnlySubcriber();
    error SubscriptionManager_PaymentNotDueYet();
}
