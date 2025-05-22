
import { FileText, MessageCircle, Link as LinkIcon } from "lucide-react";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="glass-card rounded-lg p-6 transition-all duration-300 hover:translate-y-[-5px]">
      <div className="inline-flex items-center justify-center rounded-lg bg-alpaca-purple/20 p-3 mb-4">
        <Icon className="h-6 w-6 text-alpaca-purple" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Notes",
      description: "Upload, access and share trading research and strategies with fellow members."
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Discuss market movements and trading opportunities in real-time."
    },
    {
      icon: LinkIcon,
      title: "Discord Integration",
      description: "Seamlessly connect with our Discord community for deeper discussions."
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trading Made <span className="text-alpaca-purple">Better</span> Together
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform provides everything you need to elevate your trading knowledge
            and connect with like-minded investors.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-alpaca-purple/50 to-transparent" />
    </section>
  );
};

export default Features;