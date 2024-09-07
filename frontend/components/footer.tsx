import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-muted py-8 sm:py-12 ">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:gap-0">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <img className="h-8 w-8 mr-2" src="/zeroLinkLogo.png" />
          <span className="text-lg font-semibold">ZeroLink</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:underline hover:underline-offset-4"
            prefetch={false}
          >
            Home
          </Link>
          <Link
            href="sSubscriptions"
            className="text-sm font-medium hover:underline hover:underline-offset-4"
            prefetch={false}
          >
            Subscriptions
          </Link>
          <Link
            href="/howitworks"
            className="text-sm font-medium hover:underline hover:underline-offset-4"
            prefetch={false}
          >
            How it works
          </Link>
          <Link
            href="/auth"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function MountainIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
