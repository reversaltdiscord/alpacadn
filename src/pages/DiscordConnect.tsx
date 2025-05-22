
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const DiscordConnect = () => {
  const { toast } = useToast();

  const handleConnectClick = () => {
    toast({
      title: "Supabase Connection Required",
      description: "Please connect to Supabase to enable Discord integration.",
    });
  };

  return (
    <div className="min-h-screen bg-alpaca-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discord Integration</h1>
          <p className="text-gray-400">
            Connect your Discord account to access exclusive features and community
          </p>
        </div>
        
        <div className="max-w-lg mx-auto">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="mr-2 text-[#5865F2]"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
                </svg>
                Connect to Discord
              </CardTitle>
              <CardDescription>
                Join our trading community on Discord to access exclusive channels and trading resources.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Benefits of Connecting</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                    <li>Access to private trading channels</li>
                    <li>Real-time market alerts</li>
                    <li>Direct communication with experienced traders</li>
                    <li>Trading strategy discussions</li>
                    <li>Early access to trading research</li>
                  </ul>
                </div>
                
                <Button
                  onClick={handleConnectClick}
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                >
                  Connect Discord Account
                </Button>
                
                <p className="text-xs text-center text-gray-400">
                  By connecting your Discord account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DiscordConnect;
