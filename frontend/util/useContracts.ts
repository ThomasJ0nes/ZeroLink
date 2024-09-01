// hook to use contracts
import { useWeb3Auth } from "@/context/Web3AuthContext";
import { Contract, ethers } from "ethers";
import SubscriptionManagerABI from "../../contracts/ignition/deployments/chain-11155111/artifacts/SubscriptionManagerModule#SubscriptionManager.json";
import PaymentProcessorABI from "../../contracts/ignition/deployments/chain-84532/artifacts/PaymentProcessorModule#PaymentProcessor.json";

// contract addresses
const SUBSCRIPTION_MANAGER_ADDRESS = '0x57158c971c8C146F3ed93F695a3c3b0B95052c55';
const PAYMENT_PROCESSOR_ADDRESS = '0xB4b29499D53839Fd601725A6B4c2abbdF05A7133';

export const useContracts = () => {
  const { provider } = useWeb3Auth();

  if (!provider) {
    return {
      getSubscriptionManagerContract: async () => { throw new Error("Web3Auth provider is not available"); },
      getPaymentProcessorContract: async () => { throw new Error("Web3Auth provider is not available"); },
    };
  }

  // Convert provider to ethers provider
  const ethersProvider = new ethers.BrowserProvider(provider as any);

  const getSubscriptionManagerContract = async () => {
    const signer = await ethersProvider.getSigner(); // Await the signer
    return new Contract(SUBSCRIPTION_MANAGER_ADDRESS, SubscriptionManagerABI.abi, signer);
  };

  const getPaymentProcessorContract = async () => {
    const signer = await ethersProvider.getSigner(); // Await the signer
    return new Contract(PAYMENT_PROCESSOR_ADDRESS, PaymentProcessorABI.abi, signer);
  };

  return { getSubscriptionManagerContract, getPaymentProcessorContract };
};
