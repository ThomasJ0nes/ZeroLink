// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library Types {
	struct Subscription {
		uint256 subscriptionId;
		address provider;
		string name;
		uint256 amount;
		uint256 interval;
	}

	struct SubscribedSubscription {
		uint256 subscriptionId;
		uint256 nextPaymentDate;
	}

	struct DetailedSubscribedSubscription {
		uint256 subscriptionId;
		address provider;
		string name;
		uint256 amount;
		uint256 interval;
		uint256 nextPaymentDate;
	}
}
