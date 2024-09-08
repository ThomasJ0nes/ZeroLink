"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth } from "@/context/Web3AuthContext";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";

export default function AuthPage() {
    const { user, login } = useWeb3Auth();
    const router = useRouter();
    const [showAuthAlert, setShowAuthAlert] = useState(false);
    const [alertDismissed, setAlertDismissed] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const authRequired = params.get("authRequired");

        if (authRequired === "true") {
            setShowAuthAlert(true);
        } else {
            setAlertDismissed(true);
        }

        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    // Add a cooldown period or limit login attempts
    const [loginAttempts, setLoginAttempts] = useState(0);
    useEffect(() => {
        if (alertDismissed && !user && loginAttempts < 3) {
            login();
            setLoginAttempts(prev => prev + 1);
        }
    }, [alertDismissed, user, login, loginAttempts]);

    // Reset login attempts when user changes
    useEffect(() => {
        if (user) {
            setLoginAttempts(0);
        }
    }, [user]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Button
                size="sm"
                className="btn btn-primary"
                onClick={login}
            >
                Log in
            </Button>

            <AlertDialog open={showAuthAlert} onOpenChange={setShowAuthAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setShowAuthAlert(false);
                                setAlertDismissed(true); // Dismiss alert and continue login
                            }}
                        >
                            OK
                        </button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
