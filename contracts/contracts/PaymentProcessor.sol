//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { OAppSender, MessagingParams, MessagingFee } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import { OAppReceiver, Origin } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppReceiver.sol";
import { OptionsBuilder } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";
import { OAppCore } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppCore.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import { ILogAutomation, Log } from "@chainlink/contracts/src/v0.8/automation/interfaces/ILogAutomation.sol";
import { IPaymentProcessor } from "./interfaces/IPaymentProcessor.sol";

contract PaymentProcessor is
	OAppSender,
	OAppReceiver,
	ILogAutomation,
	IPaymentProcessor
{
	using OptionsBuilder for bytes;
	using SafeERC20 for IERC20;

	uint32 public constant SEPOLIA_EID = 40161;

	bytes lzOptions =
		OptionsBuilder.newOptions().addExecutorLzReceiveOption(1000000, 0);

	uint64 public constant SEPOLIA_CHAIN_SELECTOR = 16015286601757825753;
	IRouterClient public router;
	address public usdcToken;

	/**
	 * @notice Initializes the OApp with the source chain's endpoint address.
	 * @param _endpoint The endpoint address from LayerZero
	 * @param _router The router address from ChainLink CCIP
	 * @param _usdcToken The usdc address from ChainLink CCIP
	 */
	constructor(
		address _endpoint,
		address _router,
		address _usdcToken
	) OAppCore(_endpoint, msg.sender) Ownable(msg.sender) {
		router = IRouterClient(_router);
		usdcToken = _usdcToken;
	}

	receive() external payable {}

	function checkLog(
		Log calldata _log,
		bytes memory
	) external pure returns (bool upkeepNeeded, bytes memory performData) {
		upkeepNeeded = true;
		performData = _log.data;
	}

	function performUpkeep(bytes calldata _performData) external override {
		(
			uint256 subscriptionId,
			address subscriber,
			address provider,
			uint256 amount,
			,
			,

		) = abi.decode(
				_performData,
				(uint256, address, address, uint256, uint32, bytes32, uint64)
			);

		if (IERC20(usdcToken).allowance(subscriber, address(this)) != amount) {
			revert PaymentProcessor_NotApprovedToTransferUSDCToken();
		}
		IERC20(usdcToken).safeTransferFrom(subscriber, address(this), amount);
		_transferTokensPayNative(provider, amount);

		// Prepare the payload and send it to the target chain
		bytes memory encodedMessage = abi.encode(subscriptionId, subscriber);
		MessagingFee memory messagingFee = _quote(
			SEPOLIA_EID,
			encodedMessage,
			lzOptions,
			false
		);
		if (messagingFee.nativeFee > address(this).balance)
			revert PaymentProcessor_NotEnoughBalanceToSendMessage(
				address(this).balance,
				messagingFee.nativeFee
			);
		endpoint.send{ value: messagingFee.nativeFee }(
			MessagingParams(
				SEPOLIA_EID,
				_getPeerOrRevert(SEPOLIA_EID),
				encodedMessage,
				lzOptions,
				false
			),
			address(this)
		);

		emit MessageSent(subscriptionId, subscriber, SEPOLIA_EID);
	}

	function setLzOptions(uint128 _gas) public onlyOwner {
		lzOptions = OptionsBuilder.newOptions().addExecutorLzReceiveOption(
			_gas,
			0
		);
	}

	function withdraw(address _beneficiary) public onlyOwner {
		uint256 amount = address(this).balance;
		if (amount == 0) revert PaymentProcessor_NothingToWithdraw();

		(bool sent, ) = _beneficiary.call{ value: amount }("");
		if (!sent)
			revert PaymentProcessor_FailedToWithdrawEth(
				msg.sender,
				_beneficiary,
				amount
			);
	}

	function addressToBytes32(address _addr) public pure returns (bytes32) {
		return bytes32(uint256(uint160(_addr)));
	}

	function bytes32ToAddress(bytes32 _b) public pure returns (address) {
		return address(uint160(uint256(_b)));
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
		(
			uint256 subscriptionId,
			address subscriber,
			address provider,
			uint256 amount
		) = abi.decode(_message, (uint256, address, address, uint256));

		// Emit the event with the decoded message and sender's EID
		emit MessageReceived(
			subscriptionId,
			subscriber,
			provider,
			amount,
			_origin.srcEid,
			_origin.sender,
			_origin.nonce
		);
	}

	function _transferTokensPayNative(
		address _provider,
		uint256 _amount
	) internal {
		// Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
		// address(0) means fees are paid in native gas
		Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
			_provider,
			_amount,
			address(0)
		);

		// Get the fee required to send the message
		uint256 fees = router.getFee(SEPOLIA_CHAIN_SELECTOR, evm2AnyMessage);

		if (fees > address(this).balance)
			revert PaymentProcessor_NotEnoughBalanceToTransferTokens(
				address(this).balance,
				fees
			);

		// approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
		IERC20(usdcToken).approve(address(router), _amount);

		// Send the message through the router and store the returned message ID
		bytes32 messageId = router.ccipSend{ value: fees }(
			SEPOLIA_CHAIN_SELECTOR,
			evm2AnyMessage
		);

		// Emit an event with message details
		emit TokensTransferred(
			messageId,
			SEPOLIA_CHAIN_SELECTOR,
			_provider,
			usdcToken,
			_amount,
			address(0),
			fees
		);
	}

	/// @notice Construct a CCIP message.
	/// @dev This function will create an EVM2AnyMessage struct with all the necessary information for tokens transfer.
	/// @param _receiver The address of the receiver.
	/// @param _amount The amount of the token to be transferred.
	/// @param _feeTokenAddress The address of the token used for fees. Set address(0) for native gas.
	/// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
	function _buildCCIPMessage(
		address _receiver,
		uint256 _amount,
		address _feeTokenAddress
	) private view returns (Client.EVM2AnyMessage memory) {
		// Set the token amounts
		Client.EVMTokenAmount[]
			memory tokenAmounts = new Client.EVMTokenAmount[](1);
		tokenAmounts[0] = Client.EVMTokenAmount({
			token: usdcToken,
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
					Client.EVMExtraArgsV1({ gasLimit: 0 })
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