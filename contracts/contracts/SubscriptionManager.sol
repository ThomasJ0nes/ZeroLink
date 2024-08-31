// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {OAppSender, MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import {OAppReceiver, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppReceiver.sol";
import {OptionsBuilder} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";
import {OAppCore} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppCore.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISubscriptionManager} from "./interfaces/ISubscriptionManager.sol";

contract SubscriptionManager is OAppSender, OAppReceiver, ISubscriptionManager {
    using OptionsBuilder for bytes;

    struct Subscription {
        address user; // The address of the subscriber
        address serviceProvider; // The address of the service provider
        uint256 amount; // Subscription amount to be paid
        uint256 interval; // Payment interval in seconds
        uint256 nextPaymentDate; // The timestamp for the next payment
    }

    uint32 public constant BASE_SEPOLIA_EID = 40245;
    /// The `_options` variable is typically provided as an argument to both the `_quote` and `_lzSend` functions.
    /// In this example, we demonstrate how to generate the `bytes` value for `_options` and pass it manually.
    /// The `OptionsBuilder` is used to create new options and add an executor option for `LzReceive` with specified parameters.
    /// An off-chain equivalent can be found under 'Message Execution Options' in the LayerZero V2 Documentation.
    bytes _options =
        OptionsBuilder.newOptions().addExecutorLzReceiveOption(50000, 0);

    uint256 public subscriptionCounter;
    mapping(uint256 => Subscription) public subscriptions;
    mapping(address => uint256[]) public userSubscriptions;

    /**
     * @notice Initializes the OApp with the source chain's endpoint address.
     * @param _endpoint The endpoint address.
     */
    constructor(
        address _endpoint
    ) OAppCore(_endpoint, /*owner*/ msg.sender) Ownable(msg.sender) {}

    function createSubscription(
        address serviceProvider,
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

        Subscription memory subscription = Subscription(
            msg.sender,
            serviceProvider,
            amount,
            interval,
            block.timestamp + interval
        );

        subscriptions[subscriptionId] = subscription;
        userSubscriptions[msg.sender].push(subscriptionId);

        emit SubscriptionCreated(
            subscriptionId,
            msg.sender,
            serviceProvider,
            amount,
            interval,
            block.timestamp + interval
        );

        return subscriptionId;
    }

    function triggerPayment(uint256 subscriptionId) public payable {
        Subscription memory subscription = subscriptions[subscriptionId];
        if (subscription.user != msg.sender) {
            revert SubscriptionManager_OnlySubcriber();
        }
        if (subscription.nextPaymentDate > block.timestamp) {
            revert SubscriptionManager_PaymentNotDueYet();
        }

        // Prepare the payload and send it to the target chain
        bytes memory encodedMessage = abi.encode(
            subscriptionId,
            subscription.user,
            subscription.serviceProvider,
            subscription.amount
        );
        _lzSend(
            BASE_SEPOLIA_EID,
            encodedMessage,
            _options,
            // Fee in native gas and ZRO token.
            MessagingFee(msg.value, 0),
            // Refund address in case of failed source message.
            payable(msg.sender)
        );

        emit PaymentInitiated(
            subscriptionId,
            subscription.user,
            subscription.serviceProvider,
            subscription.amount
        );

        emit MessageSent(
            subscriptionId,
            subscription.user,
            subscription.serviceProvider,
            subscription.amount,
            BASE_SEPOLIA_EID
        );
    }

    function getUserSubscriptions(
        address user
    ) public view returns (uint256[] memory) {
        return userSubscriptions[user];
    }

    /**
     * @dev Converts an address to bytes32.
     * @param _addr The address to convert.
     * @return The bytes32 representation of the address.
     */
    function addressToBytes32(address _addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    /**
     * @dev Converts bytes32 to an address.
     * @param _b The bytes32 value to convert.
     * @return The address representation of bytes32.
     */
    function bytes32ToAddress(bytes32 _b) public pure returns (address) {
        return address(uint160(uint256(_b)));
    }

    /**
     * @dev Quotes the gas needed to pay for the full omnichain transaction in native gas.
     * @param subscriptionId Subscription ID.
     * @notice _options variable is typically provided as an argument and not hard-coded.
     */
    function quote(
        uint256 subscriptionId
    ) public view returns (MessagingFee memory fee) {
        Subscription memory subscription = subscriptions[subscriptionId];
        bytes memory payload = abi.encode(
            subscriptionId,
            subscription.user,
            subscription.serviceProvider,
            subscription.amount
        );
        fee = _quote(BASE_SEPOLIA_EID, payload, _options, false);
    }

    /**
     * @dev Called when the Executor executes EndpointV2.lzReceive. It overrides the equivalent function in the parent OApp contract.
     * Protocol messages are defined as packets, comprised of the following parameters.
     * @param _origin A struct containing information about where the packet came from.
     * _guid A global unique identifier for tracking the packet.
     * @param message Encoded message.
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata message,
        address /*executor*/, // Executor address as specified by the OApp.
        bytes calldata /*_extraData*/ // Any extra data or options to trigger on receipt.
    ) internal override {
        // Decode the payload to get the message
        uint256 subscriptionId = abi.decode(message, (uint256));

        Subscription memory subscription = subscriptions[subscriptionId];

        // Update the next payment date for the subscription
        subscription.nextPaymentDate += subscription.interval;

        // Emit the event with the decoded message and sender's EID
        emit MessageReceived(
            subscriptionId,
            _origin.srcEid,
            _origin.sender,
            _origin.nonce
        );

        emit PaymentFinished(subscriptionId, subscription.nextPaymentDate);
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
