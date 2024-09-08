# ZeroLink - Cross-Chain Subscription Payments Platform


ZeroLink is a decentralized cross-chain subscription payments platform designed to facilitate recurring payments across multiple blockchains. This solution allows users to choose their preferred blockchain for payments, optimizing for factors such as lower gas fees and token liquidity. Leveraging technologies like LayerZero for cross-chain communication and Chainlink CCIP for token transfers, ZeroLink enables seamless, secure, and automated subscription payments across various chains.


Key Features
- Cross-Chain Subscription Management: Allows users to create and manage subscriptions that support cross-chain payments.
- Decentralized Payment Processing: Facilitates the transfer of ERC-20 tokens between users and service providers across blockchains.
- LayerZero and Chainlink CCIP Integration: Ensures reliable cross-chain communication and secure token transfers.
- Can Blockchain Agnostic: Supports multiple blockchains, including Ethereum, BSC, Optimism, and others.
- User-Centric Platform: Enables users to subscribe, unsubscribe, and manage subscriptions while paying in their preferred cryptocurrency on their chosen blockchain.



Contracts Overview
Types.sol
Defines the structs used in both the SubscriptionManager and PaymentProcessor contracts.

ISubscriptionManager.sol
Defines the events and errors used in the SubscriptionManager contract.

IPaymentProcessor.sol
Defines the events and errors used in the PaymentProcessor contract.

SubscriptionManager.sol
Manages subscriptions with the following key functions:

- createSubscription: Create new subscriptions.
- updateSubscription: Update existing subscriptions.
- subscribeSubscription: Subscribe and make initial payments.
- unsubscribeSubscription: Unsubscribe from a subscription.
- makePayment: Make payments for due subscriptions.
- getAllSubscriptions: Retrieve all user-created subscriptions.
- getAllSubscriptionsForProvider: Get subscriptions for a specific provider.
- getAllSubscriptionsForSubscriber: View subscriptions a user has subscribed to.
- quote: Provides LayerZero fee for cross-chain messages.
- _lzReceive: Handles incoming LayerZero messages.

PaymentProcessor.sol
Handles payment processing for cross-chain subscriptions.

- checkLog: Prepares data for Chainlink Automation's performUpkeep function.
- performUpkeep: Executes USDC token transfers using Chainlink CCIP.
- _lzReceive: Processes incoming LayerZero messages.
- _transferTokensPayNative: Transfers tokens and processes ETH payments on Optimism Sepolia.
- _buildCCIPMessage: Constructs messages for CCIP transfers.


Technical Architecture
User Interface (Frontend)

The frontend is built using Next.js, and is to demo and showcase how the contracts would interact with the front-end. 
Everything on the front end works other than the trigger of subscriptions payment that we didnt have time to implement but everything else works like connecting to web3auth fetching subscriptions, showing users subscriptions in the dashbaord. 

Browse and manage subscriptions.
Choose chain they are connected to using Web3Auth
View payment history and receive notifications.
LayerZero is integrated to enable secure cross-chain message passing between blockchains. This allows users to pay on a different blockchain than the service provider.

Token Transfers via Chainlink CCIP
Chainlink CCIP ensures secure and reliable cross-chain token transfers, managing ERC-20 tokens like USDC between users and service providers. To showcase this we are using Eth Sepolia and Optimism Sepolia to show the cross chain transaction. 
