import { useWeb3Auth } from "@/context/Web3AuthContext";
import { Contract, ethers } from "ethers";
import SubscriptionManagerABI from "../../contracts/ignition/deployments/chain-11155111/artifacts/SubscriptionManagerModule#SubscriptionManager.json";
import PaymentProcessorABI from "../../contracts/ignition/deployments/chain-84532/artifacts/PaymentProcessorModule#PaymentProcessor.json";

// Contract addresses
const SUBSCRIPTION_MANAGER_ADDRESS = '0x52a09DA09a777086a7F5F58cC6E9c32cA793a604';
const PAYMENT_PROCESSOR_ADDRESS = '0xB4b29499D53839Fd601725A6B4c2abbdF05A7133';

export const useContracts = () => {
  const { provider, loggedIn } = useWeb3Auth(); // Access provider and login status from context

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
    return new Contract(PAYMENT_PROCESSOR_ADDRESS, PaymentProcessorABI.abi, signer);
  };


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
  console.log(logs);
  console.log(logs[0]?.args[0]);

  for (let i = 0; i < logs.length; i++) {
    // Get the date of this payment
    const block = await ethersProvider.getBlock(logs[i].blockNumber);
    const eventDate = new Date(block.timestamp * 1000);

    payments.push({
      id: i,
      date: eventDate,
      service: "Netflix",
      amount: ethers.formatUnits(logs[i]?.args[3], "ether"),
      blockchain: "Ethereum",
      status: "Completed",
      hash: logs[i].transactionHash
    });
    return payments;
  }
}

  return { getSubscriptionManagerContract, getPaymentProcessorContract, fetchAllSubscriptions, fetchPaymentHistory };
};
