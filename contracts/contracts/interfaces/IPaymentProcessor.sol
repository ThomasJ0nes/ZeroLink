// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPaymentProcessor {
    // Event emitted when the tokens are transferred to an account on another chain.
    event TokensTransferred(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        address token,
        uint256 tokenAmount,
        address feeToken,
        uint256 fees
    );
    event MessageSent(uint256 subscriptionId, uint32 dstEid);
    event MessageReceived(
        uint256 subscriptionId,
        address user,
        address serviceProvider,
        uint256 amount,
        uint32 senderEid,
        bytes32 sender,
        uint64 nonce
    );

    // Custom errors to provide more descriptive revert messages.
    error PaymentProcessor_NotEnoughBalanceToTransferTokens(
        uint256 currentBalance,
        uint256 calculatedFees
    );
    error PaymentProcessor_NotEnoughBalanceToSendMessage(
        uint256 currentBalance,
        uint256 calculatedFees
    );
    error PaymentProcessor_NothingToWithdraw();
    error PaymentProcessor_FailedToWithdrawEth(
        address owner,
        address target,
        uint256 value
    );
    error PaymentProcessor_DestinationChainNotAllowlisted(
        uint64 destinationChainSelector
    );
    error PaymentProcessor_InvalidReceiverAddress();
}
