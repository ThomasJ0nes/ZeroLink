"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const NavLinks = () => (
    <>
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Home
      </Link>
      <Link
        href="/subscriptions"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Subscriptions
      </Link>
      <Link
        href="/howitworks"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        How it works
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between md:justify-start">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">ZeroLink</span>
          </Link>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                onClick={toggleMenu}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link
                href="/"
                className="flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <span className="font-bold">ZeroLink</span>
              </Link>
              <nav className="flex flex-col space-y-4 mt-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Center links */}
        <div className="hidden flex-1 md:flex justify-center">
          <nav className="flex items-center space-x-6">
            <NavLinks />
          </nav>
        </div>

        {/* Sign Up button */}
        <div className="flex-1 flex justify-end">
          <Button size="sm">Sign Up</Button>
        </div>
      </div>
    </header>
  );
}
