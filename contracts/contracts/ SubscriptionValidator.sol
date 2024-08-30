// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OAppReceiver, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppReceiver.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract SubscriptionValidator is OAppReceiver, Ownable {
    struct Subscription {
        address userAddress;
        uint256 amount;
        uint256 nextDueDate;
        bool paid;
    }

    mapping(uint256 => Subscription) public subscriptions;

    event PaymentReceived(uint256 subscriptionId, address userAddress, uint256 amount);
    event SubscriptionUpdated(uint256 subscriptionId, address userAddress, bool paid, uint256 nextDueDate);

    constructor(address _endpoint) OAppReceiver(_endpoint) Ownable() {}

    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        (uint256 subscriptionId, uint256 amount, address userAddress) = abi.decode(_message, (uint256, uint256, address));
        _processPayment(subscriptionId, amount, userAddress);

        // Handle updating the subscription status if the message contains status info
        if (_message.length == 96) {  // 96 bytes when a subscription ID, amount, user address, paid status, and next due date are all included
            (uint256 subId, bool paid, uint256 nextDueDate) = abi.decode(_message, (uint256, bool, uint256));
            _updateSubscriptionStatus(subId, paid, nextDueDate);
        }
    }

    function _processPayment(uint256 _subscriptionId, uint256 _amount, address _userAddress) internal {
        Subscription storage subscription = subscriptions[_subscriptionId];
        require(subscription.userAddress == address(0) || subscription.userAddress == _userAddress, "Invalid subscription");
        require(subscription.amount == 0 || subscription.amount == _amount, "Incorrect amount");

        // Update subscription details
        subscription.userAddress = _userAddress;
        subscription.amount = _amount;
        subscription.paid = true;

        emit PaymentReceived(_subscriptionId, _userAddress, _amount);
    }

    function _updateSubscriptionStatus(uint256 _subscriptionId, bool _paid, uint256 _nextDueDate) internal {
        Subscription storage subscription = subscriptions[_subscriptionId];
        subscription.paid = _paid;
        subscription.nextDueDate = _nextDueDate;

        emit SubscriptionUpdated(_subscriptionId, subscription.userAddress, _paid, _nextDueDate);
    }

    function getSubscriptionDetails(uint256 _subscriptionId) external view returns (address, uint256, uint256, bool) {
        Subscription memory subscription = subscriptions[_subscriptionId];
        return (subscription.userAddress, subscription.amount, subscription.nextDueDate, subscription.paid);
    }
}
