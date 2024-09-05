// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library Types {
    struct Subscription {
        address serviceProvider;
        string serviceName;
        uint256 amount;
        uint256 interval;
        bool active;
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
