//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {OAppSender, MessagingParams, MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import {OAppReceiver, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppReceiver.sol";
import {OptionsBuilder} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";
import {OAppCore} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppCore.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
// import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPaymentProcessor} from "./interfaces/IPaymentProcessor.sol";

contract PaymentProcessor is OAppSender, OAppReceiver, IPaymentProcessor {
    using OptionsBuilder for bytes;
    using SafeERC20 for IERC20;

    uint32 public constant SEPOLIA_EID = 40161;

    /// The `_options` variable is typically provided as an argument to both the `_quote` and `_lzSend` functions.
    /// In this example, we demonstrate how to generate the `bytes` value for `_options` and pass it manually.
    /// The `OptionsBuilder` is used to create new options and add an executor option for `LzReceive` with specified parameters.
    /// An off-chain equivalent can be found under 'Message Execution Options' in the LayerZero V2 Documentation.
    bytes _options =
        OptionsBuilder.newOptions().addExecutorLzReceiveOption(3000000, 0);

    uint64 public constant SEPOLIA_CHAIN_SELECTOR = 16015286601757825753;

    //optimmism sepolia
    address public constant USDC_TOKEN = 0x5fd84259d66Cd46123540766Be93DFE6D43130D7;
    IRouterClient public s_router;
    IERC20 public s_linkToken;

    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0))
            revert PaymentProcessor_InvalidReceiverAddress();
        _;
    }

    /// @notice Constructor initializes the contract with the router address.
    /// @param _router The address of the router contract.
    /// @param _link The address of the link contract.
    constructor(
        address _endpoint,
        address _router,
        address _link
    ) OAppCore(_endpoint, /*owner*/ msg.sender) Ownable(msg.sender) {
        s_router = IRouterClient(_router);
        s_linkToken = IERC20(_link);
    }

    receive() external payable {}

    function withdraw(address _beneficiary) public onlyOwner {
        // Retrieve the balance of this contract
        uint256 amount = address(this).balance;

        // revert PaymentProcessor_if there is nothing to withdraw
        if (amount == 0) revert PaymentProcessor_NothingToWithdraw();

        // Attempt to send the funds, capturing the success status and discarding any return data
        (bool sent, ) = _beneficiary.call{value: amount}("");

        // revert PaymentProcessor_if the send failed, with information about the attempted transfer
        if (!sent)
            revert PaymentProcessor_FailedToWithdrawEth(
                msg.sender,
                _beneficiary,
                amount
            );
    }

    function withdrawToken(
        address _beneficiary,
        address _token
    ) public onlyOwner {
        // Retrieve the balance of this contract
        uint256 amount = IERC20(_token).balanceOf(address(this));

        // Revert if there is nothing to withdraw
        if (amount == 0) revert PaymentProcessor_NothingToWithdraw();

        IERC20(_token).safeTransfer(_beneficiary, amount);
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
        (
            uint256 subscriptionId,
            address user,
            address serviceProvider,
            uint256 amount
        ) = abi.decode(message, (uint256, address, address, uint256));
        // Emit the event with the decoded message and sender's EID
        emit MessageReceived(
            subscriptionId,
            user,
            serviceProvider,
            amount,
            _origin.srcEid,
            _origin.sender,
            _origin.nonce
        );

        _transferTokensPayNative(serviceProvider, amount);

        // Prepare the payload and send it to the target chain
        bytes memory encodedMessage = abi.encode(subscriptionId);
        MessagingFee memory messagingFee = _quote(
            SEPOLIA_EID,
            encodedMessage,
            _options,
            false
        );
        if (messagingFee.nativeFee > address(this).balance)
            revert PaymentProcessor_NotEnoughBalanceToSendMessage(
                address(this).balance,
                messagingFee.nativeFee
            );
        endpoint.send{value: messagingFee.nativeFee}(
            MessagingParams(
                SEPOLIA_EID,
                _getPeerOrRevert(SEPOLIA_EID),
                encodedMessage,
                _options,
                false
            ),
            address(this)
        );

        emit MessageSent(subscriptionId, SEPOLIA_EID);
    }

    function _transferTokensPayNative(
        address serviceProvider,
        uint256 amount
    ) internal validateReceiver(serviceProvider) returns (bytes32 messageId) {
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        // address(0) means fees are paid in native gas
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            serviceProvider,
            USDC_TOKEN,
            amount,
            address(0)
        );

        // Get the fee required to send the message
        uint256 fees = s_router.getFee(SEPOLIA_CHAIN_SELECTOR, evm2AnyMessage);

        if (fees > address(this).balance)
            revert PaymentProcessor_NotEnoughBalanceToTransferTokens(
                address(this).balance,
                fees
            );

        // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
        IERC20(USDC_TOKEN).approve(address(s_router), amount);

        // Send the message through the router and store the returned message ID
        messageId = s_router.ccipSend{value: fees}(
            SEPOLIA_CHAIN_SELECTOR,
            evm2AnyMessage
        );

        // Emit an event with message details
        emit TokensTransferred(
            messageId,
            SEPOLIA_CHAIN_SELECTOR,
            serviceProvider,
            USDC_TOKEN,
            amount,
            address(0),
            fees
        );

        // Return the message ID
        return messageId;
    }

    /// @notice Construct a CCIP message.
    /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for tokens transfer.
    /// @param _receiver The address of the receiver.
    /// @param _token The token to be transferred.
    /// @param _amount The amount of the token to be transferred.
    /// @param _feeTokenAddress The address of the token used for fees. Set address(0) for native gas.
    /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
    function _buildCCIPMessage(
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
        // Set the token amounts
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });

        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI-encoded receiver address
                data: "", // No data
                tokenAmounts: tokenAmounts, // The amount and type of token being transferred
                extraArgs: Client._argsToBytes(
                    // Additional arguments, setting gas limit to 0 as we are not sending any data
                    Client.EVMExtraArgsV1({gasLimit: 0})
                ),
                // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
                feeToken: _feeTokenAddress
            });
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
