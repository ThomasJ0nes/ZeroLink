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

    mapping(uint256 => Types.Subscription) public subscriptions;

    mapping(address => uint256[]) public providerToSubscriptions;

    mapping(address => Types.SubscribedSubscription[])
        public subscriberToSubscriptions;

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
        string calldata _name,
        uint256 _amount,
        uint256 _interval
    ) public {
        if (bytes(_name).length == 0) {
            revert SubscriptionManager_EmptyName();
        }
        if (_amount == 0) {
            revert SubscriptionManager_ZeroAmount();
        }
        if (_interval == 0) {
            revert SubscriptionManager_ZeroInterval();
        }

        uint256 subscriptionId = subscriptionCounter++;

        Types.Subscription memory subscription = Types.Subscription({
            subscriptionId: subscriptionId,
            provider: msg.sender,
            name: _name,
            amount: _amount,
            interval: _interval
        });

        subscriptions[subscriptionId] = subscription;
        providerToSubscriptions[msg.sender].push(subscriptionId);

        emit SubscriptionCreated(
            subscriptionId,
            subscription.provider,
            _name,
            _amount,
            _interval
        );
    }

    function updateSubscription(
        uint256 _subscriptionId,
        string calldata _newName,
        uint256 _newAmount,
        uint256 _newInterval
    ) public {
        Types.Subscription memory subscription = subscriptions[_subscriptionId];

        if (subscription.provider != msg.sender) {
            revert SubscriptionManager_OnlyProvider();
        }

        if (bytes(_newName).length > 0) {
            subscriptions[_subscriptionId].name = _newName;
        }
        if (_newAmount > 0) {
            subscriptions[_subscriptionId].amount = _newAmount;
        }
        if (_newInterval > 0) {
            subscriptions[_subscriptionId].interval = _newInterval;
        }

        emit SubscriptionUpdated(
            _subscriptionId,
            subscription.provider,
            _newName,
            _newAmount,
            _newInterval
        );
    }

    function subscribeSubscription(
        uint256 _subscriptionId,
        string calldata _preferredBlockchain
    ) public payable {
        Types.Subscription memory subscription = subscriptions[_subscriptionId];

        if (subscription.provider == msg.sender) {
            revert SubscriptionManager_NotProvider();
        }

        // Check if the user has already subscribed to this subscription
        uint256 subscriptionsLength = subscriberToSubscriptions[msg.sender]
            .length;
        for (uint256 i = 0; i < subscriptionsLength; i++) {
            if (
                subscriberToSubscriptions[msg.sender][i].subscriptionId ==
                _subscriptionId
            ) {
                revert SubscriptionManager_AlreadySubscribed();
            }
        }

        // If the user has not already subscribed, proceed with the subscription
        subscriberToSubscriptions[msg.sender].push(
            Types.SubscribedSubscription({
                subscriptionId: _subscriptionId,
                nextPaymentDate: block.timestamp
            })
        );

        emit SubscriptionSubscribed(_subscriptionId, msg.sender);

        // Prepare the payload and send it to the target chain
        bytes memory encodedMessage = abi.encode(
            _subscriptionId,
            msg.sender,
            subscription.provider,
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
            subscription.provider,
            subscription.amount
        );

        emit MessageSent(
            _subscriptionId,
            msg.sender,
            subscription.provider,
            subscription.amount,
            lzBlockchainEIDs[_preferredBlockchain]
        );
    }

    function unsubscribeSubscription(uint256 _subscriptionId) public {
        bool found = false;

        uint256 subscriptionsLength = subscriberToSubscriptions[msg.sender]
            .length;
        for (uint256 i = 0; i < subscriptionsLength; i++) {
            if (
                subscriberToSubscriptions[msg.sender][i].subscriptionId ==
                _subscriptionId
            ) {
                found = true;

                // Pop the last element and replace the current element with it
                subscriberToSubscriptions[msg.sender][
                    i
                ] = subscriberToSubscriptions[msg.sender][
                    subscriptionsLength - 1
                ];
                subscriberToSubscriptions[msg.sender].pop();

                emit SubscriptionUnsubscribed(_subscriptionId, msg.sender);

                break;
            }
        }

        if (!found) {
            revert SubscriptionManager_OnlySubcriber();
        }
    }

    function makePayment(
        uint256 _subscriptionId,
        string calldata _preferredBlockchain
    ) public payable {
        bool found = false;

        uint256 subscriptionsLength = subscriberToSubscriptions[msg.sender]
            .length;

        for (uint256 i = 0; i < subscriptionsLength; i++) {
            if (
                subscriberToSubscriptions[msg.sender][i].subscriptionId ==
                _subscriptionId
            ) {
                found = true;

                Types.Subscription memory subscription = subscriptions[
                    _subscriptionId
                ];
                Types.SubscribedSubscription
                    memory userSubscription = subscriberToSubscriptions[
                        msg.sender
                    ][i];

                if (userSubscription.nextPaymentDate > block.timestamp) {
                    revert SubscriptionManager_PaymentNotDueYet();
                }

                // Prepare the payload and send it to the target chain
                bytes memory encodedMessage = abi.encode(
                    _subscriptionId,
                    msg.sender,
                    subscription.provider,
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
                    subscription.provider,
                    subscription.amount
                );

                emit MessageSent(
                    _subscriptionId,
                    msg.sender,
                    subscription.provider,
                    subscription.amount,
                    lzBlockchainEIDs[_preferredBlockchain]
                );

                break;
            }
        }

        if (!found) {
            revert SubscriptionManager_OnlySubcriber();
        }
    }

    function getAllSubscriptions()
        public
        view
        returns (Types.Subscription[] memory allSubscriptions)
    {
        allSubscriptions = new Types.Subscription[](subscriptionCounter);

        for (uint256 i = 0; i < subscriptionCounter; i++) {
            allSubscriptions[i] = subscriptions[i];
        }
    }

    function getAllSubscriptionsForProvider(
        address _provider
    ) public view returns (Types.Subscription[] memory allSubscriptions) {
        uint256 subscriptionsLength = providerToSubscriptions[_provider].length;

        allSubscriptions = new Types.Subscription[](subscriptionsLength);

        for (uint256 i = 0; i < subscriptionsLength; i++) {
            allSubscriptions[i] = subscriptions[
                providerToSubscriptions[_provider][i]
            ];
        }
    }

    function getAllSubscriptionsForSubscriber(
        address _subscriber
    )
        public
        view
        returns (Types.DetailedSubscribedSubscription[] memory allSubscriptions)
    {
        uint256 subscriptionsLength = subscriberToSubscriptions[_subscriber]
            .length;

        allSubscriptions = new Types.DetailedSubscribedSubscription[](
            subscriptionsLength
        );

        for (uint256 i = 0; i < subscriptionsLength; i++) {
            uint256 subscriptionId = subscriberToSubscriptions[_subscriber][i]
                .subscriptionId;
            uint nextPaymentDate = subscriberToSubscriptions[_subscriber][i]
                .nextPaymentDate;
            Types.Subscription memory subscription = subscriptions[
                subscriptionId
            ];

            Types.DetailedSubscribedSubscription
                memory detailedSubscribedSubscription = Types
                    .DetailedSubscribedSubscription({
                        subscriptionId: subscriptionId,
                        provider: subscription.provider,
                        name: subscription.name,
                        amount: subscription.amount,
                        interval: subscription.interval,
                        nextPaymentDate: nextPaymentDate
                    });

            allSubscriptions[i] = detailedSubscribedSubscription;
        }
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
            subscription.provider,
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
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/, // Executor address as specified by the OApp.
        bytes calldata /*_extraData*/ // Any extra data or options to trigger on receipt.
    ) internal override {
        // Decode the payload to get the message
        (uint256 subscriptionId, address subscriber) = abi.decode(
            _message,
            (uint256, address)
        );

        Types.Subscription memory subscription = subscriptions[subscriptionId];

        uint256 subscriptionsLength = subscriberToSubscriptions[subscriber]
            .length;
        for (uint256 i = 0; i < subscriptionsLength; i++) {
            if (
                subscriberToSubscriptions[subscriber][i].subscriptionId ==
                subscriptionId
            ) {
                subscriberToSubscriptions[subscriber][i]
                    .nextPaymentDate += subscription.interval;

                break;
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
            subscription.provider,
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
