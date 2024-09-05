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

    bytes lzOptions =
        OptionsBuilder.newOptions().addExecutorLzReceiveOption(1000000, 0);

    mapping(string => uint32) public lzBlockchainEIDs;

    uint256 public subscriptionCounter;

    mapping(uint256 => Types.Subscription) public subscriptions; // All subscriptions made by all users

    mapping(address => Types.UserSubscription[]) public userSubscriptions; // Subcribed subscriptions of each user

    /**
     * @notice Initializes the OApp with the source chain's endpoint address.
     * @param _lzEndpoint The endpoint address from LayerZero
     */
    constructor(
        address _lzEndpoint
    ) OAppCore(_lzEndpoint, msg.sender) Ownable(msg.sender) {
        lzBlockchainEIDs["optimismSepolia"] = 40232;
        lzBlockchainEIDs["polygonAmoy"] = 40267;
    }

    function setLzOptions(uint128 _gas) public onlyOwner {
        lzOptions = OptionsBuilder.newOptions().addExecutorLzReceiveOption(
            _gas,
            0
        );
    }

    function setLzBlockchainEIDs(
        string[] calldata _blockchains,
        uint32[] calldata _eids
    ) public onlyOwner {
        for (uint256 i = 0; i < _blockchains.length; i++) {
            lzBlockchainEIDs[_blockchains[i]] = _eids[i];
        }
    }

    function createSubscription(
        string calldata _serviceName,
        uint256 _amount,
        uint256 _interval
    ) public {
        if (bytes(_serviceName).length == 0) {
            revert SubscriptionManager_EmptyString();
        }
        if (_amount == 0) {
            revert SubscriptionManager_ZeroAmount();
        }
        if (_interval == 0) {
            revert SubscriptionManager_ZeroInterval();
        }

        Types.Subscription memory subscription = Types.Subscription({
            serviceProvider: msg.sender,
            serviceName: _serviceName,
            amount: _amount,
            interval: _interval,
            active: true
        });

        uint256 subscriptionId = subscriptionCounter++;
        subscriptions[subscriptionId] = subscription;

        emit SubscriptionCreated(
            subscriptionId,
            subscription.serviceProvider,
            _serviceName,
            _amount,
            _interval
        );
    }

    function updateSubscription(
        uint256 _subscriptionId,
        string calldata _newServiceName,
        uint256 _newAmount,
        uint256 _newInterval
    ) public {
        Types.Subscription memory subscription = subscriptions[_subscriptionId];

        if (subscription.serviceProvider != msg.sender) {
            revert SubscriptionManager_OnlyServiceProvider();
        }

        if (bytes(_newServiceName).length > 0) {
            subscriptions[_subscriptionId].serviceName = _newServiceName;
        }
        if (_newAmount > 0) {
            subscriptions[_subscriptionId].amount = _newAmount;
        }
        if (_newInterval > 0) {
            subscriptions[_subscriptionId].interval = _newInterval;
        }

        emit SubscriptionUpdated(
            _subscriptionId,
            subscription.serviceProvider,
            _newServiceName,
            _newAmount,
            _newInterval
        );
    }

    function changeActiveSubscription(uint256 _subscriptionId) public {
        Types.Subscription memory subscription = subscriptions[_subscriptionId];

        if (subscription.serviceProvider != msg.sender) {
            revert SubscriptionManager_OnlyServiceProvider();
        }

        subscriptions[_subscriptionId].active = !subscriptions[_subscriptionId]
            .active;

        if (subscriptions[_subscriptionId].active) {
            emit SubscriptionEnabled(_subscriptionId, msg.sender);
        } else {
            emit SubscriptionDisabled(_subscriptionId, msg.sender);
        }
    }

    // Didn't check for duplicates in case the subscriber has already subscribed to that subscription
    function subscribeSubscription(
        uint256 _subscriptionId,
        string calldata _preferredBlockchain
    ) public payable {
        Types.Subscription memory subscription = subscriptions[_subscriptionId];

        if (!subscription.active) {
            revert SubscriptionManager_InactiveSubscription();
        }

        if (subscription.serviceProvider == msg.sender) {
            revert SubscriptionManager_NotServiceProvider();
        }

        userSubscriptions[msg.sender].push(
            Types.UserSubscription({
                subscriptionId: _subscriptionId,
                serviceProvider: subscription.serviceProvider,
                serviceName: subscription.serviceName,
                amount: subscription.amount,
                interval: subscription.interval,
                nextPaymentDate: 0
            })
        );

        emit SubscriptionSubscribed(_subscriptionId, msg.sender);

        // Prepare the payload and send it to the target chain
        bytes memory encodedMessage = abi.encode(
            _subscriptionId,
            msg.sender,
            subscription.serviceProvider,
            subscription.amount
        );
        _lzSend(
            lzBlockchainEIDs[_preferredBlockchain],
            encodedMessage,
            lzOptions,
            // Fee in native gas and ZRO token.
            MessagingFee(msg.value, 0),
            // Refund address in case of failed source message.
            payable(msg.sender)
        );

        emit PaymentInitiated(
            _subscriptionId,
            msg.sender,
            subscription.serviceProvider,
            subscription.amount
        );

        emit MessageSent(
            _subscriptionId,
            msg.sender,
            subscription.serviceProvider,
            subscription.amount,
            lzBlockchainEIDs[_preferredBlockchain]
        );
    }

    function makePayment(
        uint256 _subscriptionId,
        string calldata _preferredBlockchain
    ) public payable {
        if (!subscriptions[_subscriptionId].active) {
            revert SubscriptionManager_InactiveSubscription();
        }

        bool found = false;

        uint256 userSubscriptionLength = userSubscriptions[msg.sender].length;

        for (uint256 i = 0; i < userSubscriptionLength; i++) {
            if (
                userSubscriptions[msg.sender][i].subscriptionId ==
                _subscriptionId
            ) {
                Types.UserSubscription
                    memory userSubscription = userSubscriptions[msg.sender][i];

                if (userSubscription.nextPaymentDate > block.timestamp) {
                    revert SubscriptionManager_PaymentNotDueYet();
                }

                // Prepare the payload and send it to the target chain
                bytes memory encodedMessage = abi.encode(
                    _subscriptionId,
                    msg.sender,
                    userSubscription.serviceProvider,
                    userSubscription.amount
                );
                _lzSend(
                    lzBlockchainEIDs[_preferredBlockchain],
                    encodedMessage,
                    lzOptions,
                    // Fee in native gas and ZRO token.
                    MessagingFee(msg.value, 0),
                    // Refund address in case of failed source message.
                    payable(msg.sender)
                );

                emit PaymentInitiated(
                    _subscriptionId,
                    msg.sender,
                    userSubscription.serviceProvider,
                    userSubscription.amount
                );

                emit MessageSent(
                    _subscriptionId,
                    msg.sender,
                    userSubscription.serviceProvider,
                    userSubscription.amount,
                    lzBlockchainEIDs[_preferredBlockchain]
                );

                break;
            }
        }

        if (!found) {
            revert SubscriptionManager_OnlySubcriber();
        }
    }

    function unsubscribeSubscription(uint256 _subscriptionId) public {
        if (!subscriptions[_subscriptionId].active) {
            revert SubscriptionManager_InactiveSubscription();
        }

        bool found = false;

        uint256 userSubscriptionLength = userSubscriptions[msg.sender].length;
        for (uint256 i = 0; i < userSubscriptionLength; i++) {
            if (
                userSubscriptions[msg.sender][i].subscriptionId ==
                _subscriptionId
            ) {
                found = true;
                delete userSubscriptions[msg.sender][i];

                emit SubscriptionUnsubscribed(_subscriptionId, msg.sender);

                break;
            }
        }

        if (!found) {
            revert SubscriptionManager_OnlySubcriber();
        }
    }

    function getUserActiveSubscriptions(
        address user
    )
        public
        view
        returns (Types.UserSubscription[] memory userActiveSubscriptions)
    {
        uint256 allSubsLength = userSubscriptions[user].length;
        uint256 activeSubsLength;

        for (uint256 i = 0; i < allSubsLength; i++) {
            if (
                subscriptions[userSubscriptions[user][i].subscriptionId]
                    .active == true
            ) {
                activeSubsLength++;
            }
        }

        userActiveSubscriptions = new Types.UserSubscription[](
            activeSubsLength
        );

        uint256 activeSubIndex;
        for (uint256 i = 0; i < allSubsLength; i++) {
            if (
                subscriptions[userSubscriptions[user][i].subscriptionId]
                    .active == true
            ) {
                userActiveSubscriptions[activeSubIndex] = userSubscriptions[
                    user
                ][i];
                activeSubIndex++;
            }
        }
        return userActiveSubscriptions;
    }

    function addressToBytes32(address _addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function bytes32ToAddress(bytes32 _b) public pure returns (address) {
        return address(uint160(uint256(_b)));
    }

    /**
     * @dev Quotes the gas needed to pay for the full omnichain transaction in native gas.
     * @param _subscriptionId Subscription ID.
     * @param _subscriber Subscriber address.
     * @param _preferredBlockchain Preferred blockchain.
     * @notice _options variable is typically provided as an argument and not hard-coded.
     */
    function quote(
        uint256 _subscriptionId,
        address _subscriber,
        string calldata _preferredBlockchain
    ) public view returns (MessagingFee memory fee) {
        Types.Subscription memory subscription = subscriptions[_subscriptionId];
        bytes memory payload = abi.encode(
            _subscriptionId,
            _subscriber,
            subscription.serviceProvider,
            subscription.amount
        );
        fee = _quote(
            lzBlockchainEIDs[_preferredBlockchain],
            payload,
            lzOptions,
            false
        );
    }

    /**
     * @dev Called when the Executor executes EndpointV2.lzReceive. It overrides the equivalent function in the parent OApp contract.
     * Protocol messages are defined as packets, comprised of the following parameters.
     * @param _origin A struct containing information about where the packet came from.
     * _guid A global unique identifier for tracking the packet.
     * @param _message Encoded message.
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*guid_*/,
        bytes calldata _message,
        address /*executor_*/, // Executor address as specified by the OApp.
        bytes calldata /*extraData_*/ // Any extra data or options to trigger on receipt.
    ) internal override {
        // Decode the payload to get the message
        (uint256 subscriptionId, address subscriber) = abi.decode(
            _message,
            (uint256, address)
        );

        Types.Subscription memory subscription = subscriptions[subscriptionId];

        uint256 userSubscriptionLength = userSubscriptions[subscriber].length;
        for (uint256 i = 0; i < userSubscriptionLength; i++) {
            if (
                userSubscriptions[subscriber][i].subscriptionId ==
                subscriptionId
            ) {
                userSubscriptions[subscriber][i].nextPaymentDate += subscription
                    .interval;
            }
        }

        emit MessageReceived(
            subscriptionId,
            subscriber,
            _origin.srcEid,
            _origin.sender,
            _origin.nonce
        );

        emit PaymentFinished(
            subscriptionId,
            subscriber,
            subscription.serviceProvider,
            subscription.amount
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
