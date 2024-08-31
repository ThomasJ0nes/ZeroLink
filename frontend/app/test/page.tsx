"use client";
import React, { useEffect, useState } from "react";
import { useContracts } from "@/util/useContracts";
import { useWeb3Auth } from "@/context/Web3AuthContext";
import { ethers } from "ethers";

const CreateSubscription: React.FC = () => {
  const { initializing, loggedIn, login, provider } = useWeb3Auth();
  const [serviceProvider, setServiceProvider] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [interval, setInterval] = useState<string>("");
  const { getSubscriptionManagerContract } = useContracts();

  const handleCreateSubscription = async () => {
    if (!provider || initializing) {
      alert("Please login first");
      await login();
      return;
    }

    try {
      const contract = await getSubscriptionManagerContract(); // Await the contract
      const tx = await contract.createSubscription(
        serviceProvider,
        ethers.parseEther(amount), // Convert to Wei
        parseInt(interval)
      );
      await tx.wait();
      alert("Subscription created successfully!");
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Failed to create subscription.");
    }
  };

  return (
    <div>
      {initializing ? (
        <p>Loading Web3Auth...</p>
      ) : !loggedIn ? (
        <button onClick={login}>Login with Web3Auth</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Service Provider Address"
            value={serviceProvider}
            onChange={(e) => setServiceProvider(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount (in ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Interval (in seconds)"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          />
          <button onClick={handleCreateSubscription}>
            Create Subscription
          </button>
        </>
      )}
    </div>
  );
};

export default CreateSubscription;
