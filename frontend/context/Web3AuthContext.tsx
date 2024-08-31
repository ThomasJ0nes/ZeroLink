"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";

const clientId =
  "BES8NKuLsgCGtmYytKcQcWlv8g2BlRl8ABWBcbljuB1nX5qE_gSie03KIZNpfHf9_YmVv4zpoJznpc6LGq_6lgY";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Ethereum Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
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
        setInitializing(false);

        if (web3authInstance.provider) {
          setProvider(web3authInstance.provider);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to initialize Web3Auth", error);
        setInitializing(false);
      }
    };

    init();
  }, []);

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
    if (web3auth) {
      try {
        const userInfo = await web3auth.getUserInfo();
        setUser(userInfo);
        console.log("User info:", userInfo);

        const ethersProvider = new ethers.BrowserProvider(provider as any);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    }
  };

  const logout = async () => {
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
        return formattedBalance; // Return the formatted balance
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
