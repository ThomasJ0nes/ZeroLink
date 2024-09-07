"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";

const clientId =
  "BES8NKuLsgCGtmYytKcQcWlv8g2BlRl8ABWBcbljuB1nX5qE_gSie03KIZNpfHf9_YmVv4zpoJznpc6LGq_6lgY";

// Chain configuration for Ethereum Sepolia
const ethereumSepoliaConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Ethereum Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

// Chain configuration for Optimism Sepolia
const optimismSepoliaConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa37dc", // Optimism Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/optimism_sepolia",
  displayName: "Optimism Sepolia Testnet",
  blockExplorerUrl: "https://optimism.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig: ethereumSepoliaConfig }, // Default to Ethereum Sepolia
});

interface IWeb3AuthContext {
  web3auth: Web3Auth | null;
  provider: IProvider | null;
  user: any;
  userAddress: string | null;
  loggedIn: boolean;
  initializing: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<void>;
  getBalance: () => Promise<string | null>;
  switchNetwork: (chainId: string) => Promise<void>;
  checkAuthStatus: () => Promise<boolean>; // Added back checkAuthStatus
}

const Web3AuthContext = createContext<IWeb3AuthContext | null>(null);

export const Web3AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: "sapphire_devnet",
          privateKeyProvider,
        });

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);

        const storedUserAddress = localStorage.getItem("userAddress");
        if (storedUserAddress) {
          setUserAddress(storedUserAddress); // Set userAddress from localStorage
          setLoggedIn(true);
        }

        if (web3authInstance.provider) {
          setProvider(web3authInstance.provider);
          await getUserInfo(); // Re-fetch the user info
        }

        setInitializing(false);
      } catch (error) {
        console.error("Failed to initialize Web3Auth", error);
        setInitializing(false);
      }
    };

    init();
  }, []);

  const switchNetwork = async (chainId: string) => {
    if (web3auth) {
      try {
        await web3auth.addChain(
          chainId === ethereumSepoliaConfig.chainId
            ? ethereumSepoliaConfig
            : optimismSepoliaConfig
        );
        await web3auth.switchChain({ chainId });
        console.log(`Switched to chain with ID: ${chainId}`);
      } catch (error) {
        console.error("Failed to switch network", error);
      }
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    if (web3auth && web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUser(user);
      setLoggedIn(true);
      await getUserInfo();
      return true;
    }

    const storedUserAddress = localStorage.getItem("userAddress");
    if (storedUserAddress) {
      setUserAddress(storedUserAddress);
      setLoggedIn(true);
      return true;
    }

    return false;
  };

  const login = async () => {
    if (web3auth) {
      try {
        const web3authProvider = await web3auth.connect();
        setProvider(web3authProvider);
        setLoggedIn(true);
        await getUserInfo();
      } catch (error) {
        console.error("Failed to login with Web3Auth", error);
      }
    }
  };

  const getUserInfo = async () => {
    if (provider) {
      try {
        const ethersProvider = new ethers.BrowserProvider(provider as any);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        localStorage.setItem("userAddress", address); // Store userAddress in localStorage
        console.log(
          "User Address fetched and stored in localStorage:",
          address
        );
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    } else {
      console.warn("Provider is not initialized yet");
    }
  };

  const logout = async (): Promise<void> => {
    if (web3auth) {
      try {
        await web3auth.logout();
        setProvider(null);
        setUser(null);
        setUserAddress(null);
        setLoggedIn(false);
        console.log("Logged out successfully");
      } catch (error) {
        console.error("Failed to logout with Web3Auth", error);
      }
    }
  };

  const getBalance = async (): Promise<string | null> => {
    if (provider) {
      try {
        const ethersProvider = new ethers.BrowserProvider(provider as any);
        const signer = await ethersProvider.getSigner();
        const balance = await ethersProvider.getBalance(signer.getAddress());
        const formattedBalance = ethers.formatEther(balance);
        console.log("Balance:", formattedBalance);
        return formattedBalance;
      } catch (error) {
        console.error("Error getting balance:", error);
        return null;
      }
    } else {
      console.log("Provider not initialized yet");
      return null;
    }
  };

  const value = {
    web3auth,
    provider,
    user,
    userAddress,
    loggedIn,
    initializing,
    login,
    logout,
    getUserInfo,
    getBalance,
    switchNetwork, // Provide switchNetwork method
    checkAuthStatus, // Added back checkAuthStatus
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
};

export function useWeb3Auth() {
  const context = useContext(Web3AuthContext);
  if (context === null) {
    throw new Error("useWeb3Auth must be used within a Web3AuthProvider");
  }
  return context;
}
