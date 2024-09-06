import React, { useState } from "react";
import Image from "next/image";
import { useWeb3Auth } from "../context/Web3AuthContext"; // Adjust the import path as per your project structure
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
  const { switchNetwork } = useWeb3Auth();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");

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

  const handleNetworkChange = async (value: string) => {
    setSelectedNetwork(value);
    await switchNetwork(value);
    onNetworkSwitch(); // Trigger the callback to update balance and address
  };

  const selectedNetworkData = networks.find(
    (network) => network.id === selectedNetwork
  );

  return (
    <Select onValueChange={handleNetworkChange} value={selectedNetwork}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select network">
          {selectedNetworkData && (
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
