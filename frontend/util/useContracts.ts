import { useWeb3Auth } from "@/context/Web3AuthContext";
import { Contract, ethers, AbiCoder, ZeroAddress  } from "ethers";
import SubscriptionManagerABI from "../../contracts/ignition/deployments/chain-11155111/artifacts/SubscriptionManagerModule#SubscriptionManager.json";
import OptimismPaymentProcessorABI from "../../contracts/ignition/deployments/chain-84532/artifacts/PaymentProcessorModule#PaymentProcessor.json";


const IERC20_ABI = [
  // Approve function for ERC20 tokens
  "function approve(address spender, uint256 amount) public returns (bool)"
];

// Contract addresses
const SUBSCRIPTION_MANAGER_ADDRESS = '0xCd1C892121Bd5b7228e6190C4e272d5BeaEa26AB';
const OPTIMISM_PAYMENT_PROCESSOR_ADDRESS = '0xa9A5d49510dF9E9df1ccEC4d1dE647344166d120';

export const useContracts = () => {
  const { provider, loggedIn, userAddress, switchNetwork  } = useWeb3Auth(); // Access provider and login status from context

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


 // function to handle subscription process
 const subscribeToSubscription = async (selectedChain: string) => {
  try {
    const subscriptionId = 0; // Hard-coded subscription ID
    const priceInWei = BigInt(91494101047981); // Hard-coded price in wei format
    const hardCodeUserAddress = '0xc84C26376fdAB17f463d022744013FADe75423B8'
    const hardCodeUsdcTokenAddress = '0x5fd84259d66Cd46123540766Be93DFE6D43130D7'
    const contractPaymentAddress = '0xa9A5d49510dF9E9df1ccEC4d1dE647344166d120'
    console.log('Hardcoded Price in Wei (USDC smallest unit):', priceInWei.toString());

    // Switch to the appropriate network
    if (selectedChain === "optimismSepolia") {
      await switchNetwork("0xaa37dc"); // Optimism Sepolia chain ID
    }

    const paymentProcessorContract = contractPaymentAddress;
    const subscriptionManagerContract = await getSubscriptionManagerContract();

    // Check the total number of subscriptions
    //const subscriptionCount = await subscriptionManagerContract.subscriptionCounter();
    //console.log(`Total Subscriptions Available: ${subscriptionCount}`);

    // Fetch subscription details
    //const subscriptionDetails = await subscriptionManagerContract.subscriptions(subscriptionId);
   // console.log('Subscription Details:', subscriptionDetails);

    //if (!subscriptionDetails || subscriptionDetails.provider === ZeroAddress) {
    //  throw new Error(`No subscription found for ID: ${subscriptionId}`);
   // }

    // Get LayerZero fee for the transaction
    const feeData = await subscriptionManagerContract.quote(
      subscriptionId,
      hardCodeUserAddress,
      "optimismSepolia"
    );
    const layerZeroFee = feeData.nativeFee;
    console.log('LayerZero fee:', layerZeroFee);

    // Fetch USDC token address and check if it is valid
    const usdcTokenAddress = hardCodeUsdcTokenAddress;
   // if (!usdcTokenAddress || usdcTokenAddress === ethers.constants.AddressZero) {
   //   throw new Error(`Invalid USDC token address: ${usdcTokenAddress}`);
  //  }
    console.log('USDC Token Address:', usdcTokenAddress);

    // Check if payment processor contract address is valid
   // const paymentProcessorAddress = paymentProcessorContract.address;
   // if (!paymentProcessorAddress || paymentProcessorAddress === ethers.constants.AddressZero) {
    //  throw new Error(`Invalid Payment Processor address: ${paymentProcessorAddress}`);
   // }
    console.log('Payment Processor Address:', paymentProcessorContract);

    // Fetch USDC token contract and approve spending
    const usdcTokenContract = new ethers.Contract(
      usdcTokenAddress,
      IERC20_ABI,
      await getSigner() 
    );

    const approvalTx = await usdcTokenContract.approve(
      paymentProcessorContract, // Use the valid payment processor address here
      priceInWei // Use hardcoded wei value here
    );
    await approvalTx.wait();
    console.log('USDC approval successful:', approvalTx.hash);

    // Call subscribeSubscription with LayerZero fee
    const subscribeTx = await subscriptionManagerContract.subscribeSubscription(
      subscriptionId,
      "optimismSepolia",
      {
        value: layerZeroFee, // Pass the LayerZero fee as msg.value
      }
    );
    await subscribeTx.wait();

    console.log("Subscription successful", subscribeTx);
    return { success: true, tx: subscribeTx };
  } catch (error: any) {
    console.error("Subscription failed:", error.message);
    throw error;
  }
};


const getSigner = async () => {
  const {signer} = await initializeEthers()
  return signer;
}






  return { getSubscriptionManagerContract, getPaymentProcessorContract, fetchAllSubscriptions, fetchSubscriptionsByUser, fetchPaymentHistory, subscribeToSubscription };
};
