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
    function updateSubscription(uint256 subscriptionId) public {
        // TODO: Validate onlyServiceProvider
        // TODO: Update serviceName, amount, interval
        // TODO: Emit event
    }

    // TODO: Jorge
    function deleteSubscription(uint256 subscriptionId) public {
        // TODO: Validate onlyServiceProvider
        // TODO: Delete subscription and related information
        // TODO: Emit event
    }

    // TODO: Hoang Vu
    function subscribeSubscription(
        uint256 subscriptionId,
        Types.Blockchain preferredBlockchain // Use for first payment
    ) public returns (uint256) {
        // TODO: Make the first payment when subscribe (Hoang Vu)

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

        // TODO: Emit event
    }

    // TODO: Jorge
    function unsubscribeSubscription(uint256 subscriptionId) public {
        // TODO: Validate onlySubscriber
        // TODO: Delete related information
        // TODO: Emit event
    }

    // TODO: Hoang Vu
    // function makePayment(uint256 subscriptionId) public payable {
    //     Types.Subscription memory subscription = subscriptions[subscriptionId];
    //     if (subscription.user != msg.sender) {
    //         revert SubscriptionManager_OnlySubcriber();
    //     }
    //     if (subscription.nextPaymentDate > block.timestamp) {
    //         revert SubscriptionManager_PaymentNotDueYet();
    //     }

    //     // Prepare the payload and send it to the target chain
    //     bytes memory encodedMessage = abi.encode(
    //         subscriptionId,
    //         subscription.user,
    //         subscription.serviceProviderAddress,
    //         subscription.amount
    //     );
    //     _lzSend(
    //         subscription.preferredBlockchain == Types.Blockchain.BaseSepolia
    //             ? BASE_SEPOLIA_EID
    //             : OP_SEPOLIA_EID,
    //         encodedMessage,
    //         _options,
    //         // Fee in native gas and ZRO token.
    //         MessagingFee(msg.value, 0),
    //         // Refund address in case of failed source message.
    //         payable(msg.sender)
    //     );

    //     emit PaymentInitiated(
    //         subscriptionId,
    //         subscription.user,
    //         subscription.serviceProviderAddress,
    //         subscription.amount
    //     );

    //     emit MessageSent(
    //         subscriptionId,
    //         subscription.user,
    //         subscription.serviceProviderAddress,
    //         subscription.amount,
    //         subscription.preferredBlockchain == Types.Blockchain.BaseSepolia
    //             ? BASE_SEPOLIA_EID
    //             : OP_SEPOLIA_EID
    //     );
    // }

    function addressToBytes32(address _addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function bytes32ToAddress(bytes32 _b) public pure returns (address) {
        return address(uint160(uint256(_b)));
    }

    // TODO: Hoang Vu
    /**
     * @dev Quotes the gas needed to pay for the full omnichain transaction in native gas.
     * @param subscriptionId Subscription ID.
     * @notice _options variable is typically provided as an argument and not hard-coded.
     */
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

        Types.Subscription storage subscription = subscriptions[subscriptionId];
        // subscription.nextPaymentDate += subscription.interval;

        // Emit the event with the decoded message and sender's EID
        emit MessageReceived(
            subscriptionId,
            _origin.srcEid,
            _origin.sender,
            _origin.nonce
        );

        // emit PaymentFinished(
        //     subscriptionId,
        //     subscription.user,
        //     subscription.serviceProviderAddress,
        //     subscription.amount
        // );
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
