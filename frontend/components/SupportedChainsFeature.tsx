import { CheckCircle, Clock } from "lucide-react";

const supportedChains = [
  { name: "Ethereum", logo: "/placeholder.svg?height=60&width=60" },
  { name: "Binance Smart Chain", logo: "/placeholder.svg?height=60&width=60" },
  { name: "Polygon", logo: "/placeholder.svg?height=60&width=60" },
  { name: "Avalanche", logo: "/placeholder.svg?height=60&width=60" },
];

const comingSoonChains = [
  { name: "Solana", logo: "/placeholder.svg?height=60&width=60" },
  { name: "Cardano", logo: "/placeholder.svg?height=60&width=60" },
  { name: "Polkadot", logo: "/placeholder.svg?height=60&width=60" },
];

function ChainGrid({
  chains,
  icon,
}: {
  chains: { name: string; logo: string }[];
  icon: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {chains.map((chain) => (
        <div
          key={chain.name}
          className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm"
        >
          <img
            src={chain.logo}
            alt={`${chain.name} logo`}
            className="w-16 h-16 mb-2"
          />
          <span className="text-sm font-medium text-center">{chain.name}</span>
          <div className="mt-2">{icon}</div>
        </div>
      ))}
    </div>
  );
}

export default function BlockchainSupportFeature() {
  return (
    <section className="py-12 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Supported Blockchains
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Our cross-chain subscription platform supports multiple blockchains,
          with more integrations on the way.
        </p>

        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-semibold mb-4">Currently Supported</h3>
            <ChainGrid
              chains={supportedChains}
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
            <ChainGrid
              chains={comingSoonChains}
              icon={<Clock className="w-5 h-5 text-blue-500" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
