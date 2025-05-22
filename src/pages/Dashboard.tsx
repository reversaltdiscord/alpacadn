import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { toast } = useToast();

  const handleSupabaseClick = () => {
    toast({
      title: "Supabase Connection Required",
      description: "Please connect to Supabase to enable full dashboard functionality.",
    });
  };

  return (
    <div className="min-h-screen bg-alpaca-dark">
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to AlpacaDN</h1>
          <p className="text-gray-400">Your trading community hub</p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full border border-white/10 rounded-lg bg-white/5 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-alpaca-purple/20">Overview</TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-alpaca-purple/20">Recent Notes</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-alpaca-purple/20">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Your Notes</CardTitle>
                  <CardDescription className="text-gray-400">
                    Trading insights and analyses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/5 p-4 rounded-lg text-center" onClick={handleSupabaseClick}>
                    <p className="text-gray-400">Connect to Supabase to access your notes</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Trading Activity</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your recent trades and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/5 p-4 rounded-lg text-center" onClick={handleSupabaseClick}>
                    <p className="text-gray-400">Connect to Supabase to track your activities</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Community</CardTitle>
                  <CardDescription className="text-gray-400">
                    Discussion and collaboration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/5 p-4 rounded-lg text-center" onClick={handleSupabaseClick}>
                    <p className="text-gray-400">Connect to Supabase to view community activity</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notes">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Notes</CardTitle>
                <CardDescription>
                  The latest trading insights from the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 p-4 rounded-lg text-center" onClick={handleSupabaseClick}>
                  <p className="text-gray-400">Connect to Supabase to view recent notes</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Stay updated with the latest discussions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 p-4 rounded-lg text-center" onClick={handleSupabaseClick}>
                  <p className="text-gray-400">Connect to Supabase to view messages</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;