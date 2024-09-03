// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library Types {
    enum Blockchain {
        BaseSepolia,
        OptimismSepolia
    }

    struct Subscription {
        address user; // The address of the subscriber
        string serviceProviderName;
        address serviceProviderAddress; // The address of the service provider
        uint256 amount; // Subscription amount to be paid
        uint256 interval; // Payment interval in seconds
        Blockchain preferredBlockchain;
        uint256 nextPaymentDate; // The timestamp for the next payment
    }
}
