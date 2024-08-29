"use client";

import { useEffect } from "react";
import { useWeb3Auth } from "@/context/Web3AuthContext";

export default function AuthPage() {
    const { user, login, logout, getUserInfo } = useWeb3Auth();

    useEffect(() => {
        if (user) {
            getUserInfo();
        }
    }, [user, getUserInfo]);

    return (
        <div className="flex items-center flex-col flex-grow pt-10">
            <h1 className="text-center text-2xl mb-4">Connect Your Wallet</h1>
            {!user ? (
                <button onClick={login} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Connect Wallet with Web3Auth
                </button>
            ) : (
                <>
                    <p className="mt-4">Welcome, {user.name}</p>
                    <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded mt-2">
                        Log Out
                    </button>
                </>
            )}
        </div>
    );
}
