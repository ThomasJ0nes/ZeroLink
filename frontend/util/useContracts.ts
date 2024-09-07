import { useWeb3Auth } from "@/context/Web3AuthContext";
import { Contract, ethers } from "ethers";
import SubscriptionManagerABI from "../../contracts/ignition/deployments/chain-11155111/artifacts/SubscriptionManagerModule#SubscriptionManager.json";
import OptimismPaymentProcessorABI from "../../contracts/ignition/deployments/chain-84532/artifacts/PaymentProcessorModule#PaymentProcessor.json";

// Contract addresses
const SUBSCRIPTION_MANAGER_ADDRESS = '0x6fAdcb29EC4831b4982BE5dA30191a6B0B1E3015';
const OPTIMISM_PAYMENT_PROCESSOR_ADDRESS = '0xa9A5d49510dF9E9df1ccEC4d1dE647344166d120';

export const useContracts = () => {
  const { provider, loggedIn, userAddress } = useWeb3Auth(); // Access provider and login status from context

  // Initialize ethers provider and signer only if the provider is available and user is logged in
  const initializeEthers = async () => {
    if (!provider || !loggedIn) {
      throw new Error("Wallet is not connected. Please connect your wallet.");
    }
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    const signer = await ethersProvider.getSigner(); // Await the signer properly to resolve the promise
    return { ethersProvider, signer };
  };

  const getSubscriptionManagerContract = async () => {
    const { signer } = await initializeEthers(); // Use async initialization to ensure signer is ready
    return new Contract(SUBSCRIPTION_MANAGER_ADDRESS, SubscriptionManagerABI.abi, signer);
  };

  const getPaymentProcessorContract = async () => {
    const { signer } = await initializeEthers(); // Use async initialization to ensure signer is ready
    return new Contract(OPTIMISM_PAYMENT_PROCESSOR_ADDRESS, OptimismPaymentProcessorABI.abi, signer);
  };

  const createSubscription = async (name: string, amount: string, interval: number) => {
    const contract = await getSubscriptionManagerContract();
    const tx = await contract.createSubscription(name, ethers.parseUnits(amount, "ether"), interval);
    await tx.wait();
    return tx;
  };

  const updateSubscription = async (subscriptionId: number, newName: string, newAmount: string, newInterval: number) => {
    const contract = await getSubscriptionManagerContract();
    const tx = await contract.updateSubscription(
        subscriptionId,
        newName,
        newAmount ? ethers.parseUnits(newAmount, "ether") : 0,
        newInterval
    );
    await tx.wait();
    return tx;
  };

  const subscribeSubscription = async (subscriptionId: number, preferredBlockchain: string) => {
    const contract = await getSubscriptionManagerContract();
    const fee = await contract.quote(subscriptionId, userAddress, preferredBlockchain);
    const tx = await contract.subscribeSubscription(subscriptionId, preferredBlockchain, { value: fee.nativeFee });
    await tx.wait();
    return tx;
  };

  const unsubscribeSubscription = async (subscriptionId: number) => {
    const contract = await getSubscriptionManagerContract();
    const tx = await contract.unsubscribeSubscription(subscriptionId);
    await tx.wait();
    return tx;
  };

  const getAllSubscriptions = async () => {
    const contract = await getSubscriptionManagerContract();
    const subscriptions = await contract.getAllSubscriptions();
    return subscriptions.map(formatSubscription);
  };

  const getAllSubscriptionsForProvider = async (provider: string) => {
    const contract = await getSubscriptionManagerContract();
    const subscriptions = await contract.getAllSubscriptionsForProvider(provider);
    return subscriptions.map(formatSubscription);
  };

  const getAllSubscriptionsForSubscriber = async (subscriber: string) => {
    const contract = await getSubscriptionManagerContract();
    const subscriptions = await contract.getAllSubscriptionsForSubscriber(subscriber);
    return subscriptions.map(formatDetailedSubscribedSubscription);
  };

  const formatSubscription = (subscription: any) => ({
    subscriptionId: Number(subscription.subscriptionId),
    provider: subscription.provider,
    name: subscription.name,
    amount: ethers.formatUnits(subscription.amount, "ether"),
    interval: formatInterval(Number(subscription.interval))
  });

  const formatDetailedSubscribedSubscription = (subscription: any) => ({
    ...formatSubscription(subscription),
    nextPaymentDate: new Date(Number(subscription.nextPaymentDate) * 1000).toLocaleDateString()
  });

  // Function to get all subscriptions from SubscriptionManager.sol
  const fetchAllSubscriptions = async () => {
    const contract = await getSubscriptionManagerContract();
    const subscriptionCount = await contract.subscriptionCounter();
    const subscriptions = [];

    for (let i = 0; i < subscriptionCount; i++) {
      const subscription = await contract.subscriptions(i);

      // Convert interval from seconds to a readable format using the helper function
      const intervalInSeconds = Number(subscription.interval);
      const intervalReadable = formatInterval(intervalInSeconds);

      subscriptions.push({
        id: i,
        user: subscription.user,
        serviceProvider: subscription.serviceProvider,
        amount: ethers.formatUnits(subscription.amount, "ether"),
        interval: intervalReadable, // Use the readable format for interval
        nextPaymentDate: new Date(Number(subscription.nextPaymentDate) * 1000).toLocaleDateString(),

        // Placeholder values
        name: `Subscription ${i + 1}`,
        description: "Placeholder description",
        price: `$${ethers.formatUnits(subscription.amount, "ether")}`,
        frequency: "month",
        image: "/placeholder.svg",
        chains: ["Ethereum"],
        category: "General",
      });
    }

    return subscriptions;
  };

  // Function to show the 5 most recent user subscriptions from SubscriptionManager.sol
  const fetchSubscriptionsByUser = async () => {
    const contract = await getSubscriptionManagerContract();
    const subscriptionCount = await contract.subscriptionCounter();
    let subscriptions = [];

    for (let i = 0; i < subscriptionCount; i++) {
      const subscription = await contract.subscriptions(i);

      if(userAddress == subscription.user){
        subscriptions.push({
          id: i,
          user: subscription.user,
          serviceProviderName: subscription.serviceProviderName,
          amount: ethers.formatUnits(subscription.amount, "ether"),
          nextPaymentDate: new Date(Number(subscription.nextPaymentDate) * 1000).toLocaleDateString(),
        });
      }
    }

    if (subscriptions.length > 5) {
      subscriptions = subscriptions.slice(Math.max(subscriptions.length - 5, 0));
    }

    return subscriptions;
  };

  // Helper function to convert interval in seconds to a human-readable format with proper singular/plural handling
  const formatInterval = (seconds: number): string => {
    if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    if (seconds < 2592000) {
      const weeks = Math.floor(seconds / 604800);
      return `${weeks} week${weeks === 1 ? '' : 's'}`;
    }
    if (seconds < 31536000) {
      const months = Math.floor(seconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'}`;
    }
    const years = Math.floor(seconds / 31536000);
    return `${years} year${years === 1 ? '' : 's'}`;
  };

  const fetchPaymentHistory = async () => {
    const ethersProvider = new ethers.BrowserProvider(provider as any);

    const payments = [];
    const contract = await getSubscriptionManagerContract();
    const filter = contract.filters.PaymentFinished(null);
    const logs = await contract.queryFilter(filter, 6624434, 6627434);

    for (let i = 0; i < logs.length; i++) {
      // Get the date of this payment
      const block = await ethersProvider.getBlock(logs[i].blockNumber);
      if (block) {  // Check if block is not null
        const eventDate = new Date(block.timestamp * 1000);

        // Check if this log is an EventLog by checking if it has 'args' property
        if ('args' in logs[i]) {
          const eventLog = logs[i] as ethers.EventLog; // Explicitly cast to EventLog
          if (userAddress === eventLog.args[1]) {
            payments.push({
              id: i,
              date: eventDate,
              service: "Netflix",
              amount: ethers.formatUnits(eventLog.args[3], "ether"),
              blockchain: "Ethereum",
              status: "Completed",
              hash: logs[i].transactionHash
            });
          }
        }
      }
    }

    return payments;
  };

  return {
    getSubscriptionManagerContract,
    getPaymentProcessorContract,
    createSubscription,
    updateSubscription,
    subscribeSubscription,
    unsubscribeSubscription,
    getAllSubscriptions,
    getAllSubscriptionsForProvider,
    getAllSubscriptionsForSubscriber,
    fetchAllSubscriptions,
    fetchSubscriptionsByUser,
    fetchPaymentHistory
  };
};
