"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth } from "@/context/Web3AuthContext";

export default function AuthPage() {
    const { user, login } = useWeb3Auth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        } else {
            login();
        }
    }, [user, login, router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
        </div>
    );
}
