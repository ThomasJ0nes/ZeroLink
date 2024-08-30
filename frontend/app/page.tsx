import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Cross-Chain Crypto Subscriptions
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Seamlessly manage and automate your crypto subscriptions
                  across multiple blockchains with our cutting-edge CCIP and
                  Layer Zero powered platform.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth" passHref>
                  <Button>Sign Up</Button>
                </Link>
                <Button variant="outline">Subscriptions</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
