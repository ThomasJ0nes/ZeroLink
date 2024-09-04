// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {OAppSender, MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import {OAppReceiver, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppReceiver.sol";
import {OptionsBuilder} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";
import {OAppCore} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppCore.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISubscriptionManager} from "./interfaces/ISubscriptionManager.sol";
import {Types} from "./libraries/Types.sol";

contract SubscriptionManager is OAppSender, OAppReceiver, ISubscriptionManager {
    using OptionsBuilder for bytes;

    uint32 public constant BASE_SEPOLIA_EID = 40245;
    uint32 public constant OP_SEPOLIA_EID = 40232;

    bytes _options =
        OptionsBuilder.newOptions().addExecutorLzReceiveOption(1000000, 0);

    uint256 public subscriptionCounter;
    mapping(uint256 => Types.Subscription) public subscriptions;
    mapping(address => Types.UserSubscription[]) public userSubscriptions;

    /**
     * @notice Initializes the OApp with the source chain's endpoint address.
     * @param _endpoint The endpoint address.
     */
    constructor(
        address _endpoint
    ) OAppCore(_endpoint, /*owner*/ msg.sender) Ownable(msg.sender) {}

    function setOptions(uint128 _gas) public onlyOwner {
        _options = OptionsBuilder.newOptions().addExecutorLzReceiveOption(
            _gas,
            0
        );
    }

    function createSubscription(
        string calldata serviceName,
        uint256 amount,
        uint256 interval
    ) public returns (uint256) {
        if (amount == 0) {
            revert SubscriptionManager_LowAmount();
        }
        if (interval == 0) {
            revert SubscriptionManager_LowInterval();
        }

        uint256 subscriptionId = subscriptionCounter++;

        Types.Subscription memory subscription = Types.Subscription(
            msg.sender,
            serviceName,
            amount,
            interval
        );

        subscriptions[subscriptionId] = subscription;

        emit SubscriptionCreated(
            subscriptionId,
            subscription.serviceProvider,
            subscription.serviceName,
            subscription.amount,
            subscription.interval
        );

        return subscriptionId;
    }

    // TODO: Jorge
    function updateSubscription(
        uint256 subscriptionId,
        string calldata newServiceName,
        uint256 newAmount,
        uint256 newInterval
    ) public {
        Types.Subscription storage subscription = subscriptions[subscriptionId];
        require(
            subscription.serviceProvider == msg.sender,
            "Only the service provider can update"
        );

        subscription.serviceName = newServiceName;
        subscription.amount = newAmount;
        subscription.interval = newInterval;

        emit SubscriptionUpdated(
            subscriptionId,
            subscription.serviceProvider,
            subscription.serviceName,
            subscription.amount,
            subscription.interval
        );
    }

    // TODO: Jorge
    function deleteSubscription(uint256 subscriptionId) public {
        Types.Subscription storage subscription = subscriptions[subscriptionId];
        require(
            subscription.serviceProvider == msg.sender,
            "Only the service provider can delete"
        );

        delete subscriptions[subscriptionId];

        // Remove from userSubscriptions mapping if exists
        for (uint256 i = 0; i < userSubscriptions[msg.sender].length; i++) {
            if (
                userSubscriptions[msg.sender][i].subscriptionId ==
                subscriptionId
            ) {
                delete userSubscriptions[msg.sender][i];
                break;
            }
        }

        emit SubscriptionDeleted(subscriptionId, msg.sender);
    }

    // TODO: Jorge
    function unsubscribeSubscription(uint256 subscriptionId) public {
        Types.Subscription storage subscription = subscriptions[subscriptionId];
        bool found = false;

        for (uint256 i = 0; i < userSubscriptions[msg.sender].length; i++) {
            if (
                userSubscriptions[msg.sender][i].subscriptionId ==
                subscriptionId
            ) {
                found = true;
                delete userSubscriptions[msg.sender][i];
                break;
            }
        }

        require(found, "You are not subscribed to this service");

        emit SubscriptionUnsubscribed(subscriptionId, msg.sender);
    }

    // TODO: Hoang Vu
    function subscribeSubscription(
        uint256 subscriptionId,
        Types.Blockchain preferredBlockchain // Use for first payment
    ) public returns (uint256) {
        // First payment logic should be added here, handled by Hoang Vu

        userSubscriptions[msg.sender].push(
            Types.UserSubscription({
                subscriptionId: subscriptionId,
                serviceProvider: subscriptions[subscriptionId].serviceProvider,
                serviceName: subscriptions[subscriptionId].serviceName,
                amount: subscriptions[subscriptionId].amount,
                interval: subscriptions[subscriptionId].interval,
                nextPaymentDate: block.timestamp +
                    subscriptions[subscriptionId].interval
            })
        );

        emit SubscriptionSubscribed(subscriptionId, msg.sender);

        return subscriptionId;
    }

    function addressToBytes32(address _addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function bytes32ToAddress(bytes32 _b) public pure returns (address) {
        return address(uint160(uint256(_b)));
    }

    // TODO: Hoang Vu
    function quote(
        uint256 subscriptionId,
        address subscriber,
        Types.Blockchain preferredBlockchain
    ) public view returns (MessagingFee memory fee) {
        Types.Subscription memory subscription = subscriptions[subscriptionId];
        bytes memory payload = abi.encode(
            subscriptionId,
            subscriber,
            subscription.serviceProvider,
            subscription.amount
        );
        fee = _quote(
            preferredBlockchain == Types.Blockchain.BaseSepolia
                ? BASE_SEPOLIA_EID
                : OP_SEPOLIA_EID,
            payload,
            _options,
            false
        );
    }

    // TODO: Hoang Vu
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata message,
        address /*executor*/, 
        bytes calldata /*_extraData*/ 
    ) internal override {
        uint256 subscriptionId = abi.decode(message, (uint256));
        Types.Subscription storage subscription = subscriptions[subscriptionId];

        emit MessageReceived(
            subscriptionId,
            _origin.srcEid,
            _origin.sender,
            _origin.nonce
        );
    }

    // The following functions are overrides required by Solidity.

    function oAppVersion()
        public
        pure
        override(OAppSender, OAppReceiver)
        returns (uint64 senderVersion, uint64 receiverVersion)
    {
        return (SENDER_VERSION, RECEIVER_VERSION);
    }
}
