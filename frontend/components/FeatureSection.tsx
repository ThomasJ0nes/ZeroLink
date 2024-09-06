import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Zap, Rocket, Shield, Users, Cog } from "lucide-react";

// Define a type for the feature objects
type Feature = {
  icon: React.ComponentType<{ className?: string }>; // Type for the icons
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Lightbulb,
    title: "Innovative Ideas",
    description: "Cutting-edge solutions to drive your business forward.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance for seamless user experiences.",
  },
  {
    icon: Rocket,
    title: "Easy Launch",
    description: "Get your project off the ground quickly and efficiently.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Built-in security features to protect your data.",
  },
  {
    icon: Users,
    title: "Collaborative",
    description: "Foster teamwork with our intuitive collaboration tools.",
  },
  {
    icon: Cog,
    title: "Customizable",
    description: "Tailor the platform to fit your specific needs.",
  },
];

// Define props for the FeatureCard component
type FeatureCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className=" transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <Icon className="h-8 w-8 text-primary mb-2" />
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function FeatureSection() {
  return (
    <section className="py-12 px-4 ">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 ">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
