// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPaymentProcessor {
    event MessageSent(
        uint256 subscriptionId,
        address subscriber,
        uint32 dstEid
    );
    event MessageReceived(
        uint256 subscriptionId,
        address subscriber,
        address provider,
        uint256 amount,
        uint32 senderEid,
        bytes32 sender,
        uint64 nonce
    );

    event TokensTransferred(
        bytes32 messageId,
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 tokenAmount,
        address feeToken,
        uint256 fees
    );

    error PaymentProcessor_NotApprovedToTransferUSDCToken();
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
