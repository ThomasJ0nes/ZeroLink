// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OAppSender, MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract SubscriptionManager is OAppSender, Ownable {
    using OptionsBuilder for bytes;

    struct Subscription {
        address userAddress;
        uint256 amount;
        uint256 nextDueDate;
        bool paid;
    }

    mapping(uint256 => Subscription> public subscriptions;
    uint256 public subscriptionCount;

    bytes _options = OptionsBuilder.newOptions().addExecutorLzReceiveOption(50000, 0);

    event SubscriptionCreated(uint256 subscriptionId, address userAddress, uint256 amount, uint256 nextDueDate);
    event PaymentInitiated(uint256 subscriptionId, address userAddress, uint256 amount);
    event PaymentStatusUpdated(uint256 subscriptionId, bool paid, uint256 nextDueDate);
    event MessageSent(string message, uint32 dstEid);

    constructor(address _endpoint) OAppSender(_endpoint) Ownable() {}

    function createSubscription(address _userAddress, uint256 _amount, uint256 _nextDueDate) external onlyOwner {
        subscriptionCount++;
        subscriptions[subscriptionCount] = Subscription(_userAddress, _amount, _nextDueDate, false);
        emit SubscriptionCreated(subscriptionCount, _userAddress, _amount, _nextDueDate);
    }

    function initiatePayment(uint32 _dstEid, uint256 _subscriptionId) external payable {
        Subscription storage subscription = subscriptions[_subscriptionId];
        require(subscription.nextDueDate <= block.timestamp, "Payment not due yet");

        // Prepare the payload and send it to the target chain
        bytes memory payload = abi.encode(_subscriptionId, subscription.amount, subscription.userAddress);
        _lzSend(
            _dstEid,
            payload,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );

        emit PaymentInitiated(_subscriptionId, subscription.userAddress, subscription.amount);

        // Update next due date (e.g., monthly subscription)
        subscriptions[_subscriptionId].nextDueDate += 30 days;
    }

    function updatePaymentStatus(uint32 _dstEid, uint256 _subscriptionId, bool _paid, uint256 _nextDueDate) external onlyOwner payable {
        Subscription storage subscription = subscriptions[_subscriptionId];
        subscription.paid = _paid;
        subscription.nextDueDate = _nextDueDate;

        // Prepare the payload and send it to the target chain
        bytes memory payload = abi.encode(_subscriptionId, _paid, _nextDueDate);
        _lzSend(
            _dstEid,
            payload,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );

        emit PaymentStatusUpdated(_subscriptionId, _paid, _nextDueDate);
    }

    function getSubscriptionDetails(uint256 _subscriptionId) external view returns (address, uint256, uint256, bool) {
        Subscription memory subscription = subscriptions[_subscriptionId];
        return (subscription.userAddress, subscription.amount, subscription.nextDueDate, subscription.paid);
    }

    function quote(
        uint32 _dstEid,
        string memory _message,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory payload = abi.encode(_message);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    function send(
        uint32 _dstEid,
        string memory _message
    ) external payable {
        // Encodes the message before invoking _lzSend.
        bytes memory _encodedMessage = abi.encode(_message);
        _lzSend(
            _dstEid,
            _encodedMessage,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );

        emit MessageSent(_message, _dstEid);
    }
}
