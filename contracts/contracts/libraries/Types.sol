// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library Types {
    enum Blockchain {
        BaseSepolia,
        OptimismSepolia
    }

    struct Subscription {
        address serviceProvider;
        string serviceName;
        uint256 amount;
        uint256 interval;
    }

    struct UserSubscription {
        uint256 subscriptionId;
        address serviceProvider;
        string serviceName;
        uint256 amount;
        uint256 interval;
        uint256 nextPaymentDate;
    }
}
