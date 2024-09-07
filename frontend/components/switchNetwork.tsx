import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useWeb3Auth } from "../context/Web3AuthContext";
import { BrowserProvider } from "ethers"; // Import BrowserProvider from ethers v6
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NetworkSwitcherDropdownProps {
  onNetworkSwitch: () => void; // Callback prop to trigger after network switch
}

export default function NetworkSwitcherDropdown({
  onNetworkSwitch,
}: NetworkSwitcherDropdownProps) {
  const { switchNetwork, provider, getUserInfo } = useWeb3Auth();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("0xaa36a7"); // Default to Ethereum Sepolia
  const [loading, setLoading] = useState<boolean>(true); // Track loading state

  const networks = [
    {
      id: "0xaa36a7",
      name: "Ethereum Sepolia",
      logo: "/ethereum-eth-logo.png",
    },
    {
      id: "0xaa37dc",
      name: "Optimism Sepolia",
      logo: "/optimism-ethereum-op-logo.png",
    },
  ];

  // Fetch the current network when the component mounts
  useEffect(() => {
    const savedNetwork = localStorage.getItem("selectedNetwork"); // Check for a saved network in localStorage
    if (savedNetwork) {
      setSelectedNetwork(savedNetwork);
      setLoading(false);
    } else {
      const fetchNetwork = async () => {
        if (provider) {
          try {
            // Wrap Web3Auth provider with ethers.js BrowserProvider to access network details
            const ethersProvider = new BrowserProvider(provider as any);
            const network = await ethersProvider.getNetwork();
            setSelectedNetwork(network.chainId.toString(16)); // Convert chainId to hex
          } catch (error) {
            console.error("Failed to fetch network:", error);
          } finally {
            setLoading(false); // Stop loading regardless of success or failure
          }
        } else {
          setLoading(false); // If provider is not available, stop loading
        }
      };

      fetchNetwork();
    }
  }, [provider]);

  const handleNetworkChange = async (value: string) => {
    setSelectedNetwork(value); // Update the state to reflect the selected network
    localStorage.setItem("selectedNetwork", value); // Save the selected network in localStorage
    await switchNetwork(value);
    await getUserInfo(); // Re-fetch user address after network switch
    onNetworkSwitch(); // Trigger the callback to update balance and address
  };

  const selectedNetworkData = networks.find(
    (network) => network.id === selectedNetwork
  );

  if (loading) {
    return <p>Loading network...</p>; // Simple loading state until the network is fetched
  }

  return (
    <Select onValueChange={handleNetworkChange} value={selectedNetwork}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select network">
          {selectedNetworkData ? (
            <div className="flex items-center">
              <Image
                src={selectedNetworkData.logo}
                alt={selectedNetworkData.name}
                width={24}
                height={24}
                className="mr-2"
              />
              <span>{selectedNetworkData.name}</span>
            </div>
          ) : (
            <span>{networks[0].name}</span> // Default to Sepolia network if no match
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {networks.map((network) => (
          <SelectItem key={network.id} value={network.id}>
            <div className="flex items-center">
              <Image
                src={network.logo}
                alt={network.name}
                width={24}
                height={24}
                className="mr-2"
              />
              <span>{network.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
