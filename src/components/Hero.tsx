import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleJoinClick = () => {
    toast({
      title: "Authentication Required",
      description: "Please connect to Supabase to enable authentication features.",
    });
  };

  return (
    <div className="relative min-h-[90vh] flex items-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-alpaca-purple/20 via-transparent to-transparent opacity-70" />
        <div className="grid-pattern absolute inset-0" />
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          {user ? (
            <>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 text-glow">
                <span className="text-white">Welcome back!</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Explore your dashboard, notes, and community chat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90 transition-opacity text-white text-lg"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 text-glow">
                <span className="text-white">Alpaca</span>
                <span className="text-alpaca-purple">DN</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Elevate your trading journey with our community of traders and investors.
                Share insights, learn strategies, and grow your portfolio together.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleJoinClick}
                  size="lg"
                  className="bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90 transition-opacity text-white text-lg"
                >
                  Join Now
                </Button>
                
                <Link to="/dashboard">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white/20 bg-white/5 backdrop-blur hover:bg-white/10 text-lg"
                  >
                    Explore Features
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-alpaca-purple/5 rounded-full filter blur-3xl animate-pulse-glow" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl animate-pulse-glow" />
    </div>
  );
};

export default Hero;