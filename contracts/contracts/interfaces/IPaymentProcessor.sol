// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPaymentProcessor {
    event MessageSent(
        uint256 indexed subscriptionId,
        address indexed provider,
        uint32 dstEid
    );
    event MessageReceived(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed provider,
        uint256 amount,
        uint32 senderEid,
        bytes32 sender,
        uint64 nonce
    );
    event TokensTransferred(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
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
