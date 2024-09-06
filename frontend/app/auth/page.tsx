"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth } from "@/context/Web3AuthContext";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export default function AuthPage() {
    const { user, login } = useWeb3Auth();
    const router = useRouter();
    const [showAuthAlert, setShowAuthAlert] = useState(false);
    const [alertDismissed, setAlertDismissed] = useState(false);
    const [showLoginButton, setShowLoginButton] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const authRequired = params.get("authRequired");

        if (authRequired === "true") {
            setShowAuthAlert(true);
            setShowLoginButton(false); // Hide login button if alert is shown
        } else {
            setAlertDismissed(true); // No alert needed, continue to login
            setShowLoginButton(true); // Show login button if no alert is needed
        }

        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        if (alertDismissed && !user) {
            login();
        }
    }, [alertDismissed, user, login]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Button
                size="sm"
                className="btn btn-primary"
                onClick={login}
            >
                Log in
            </Button>


            {/* Alert Dialog */}
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
