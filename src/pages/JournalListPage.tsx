import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JournalCard from "@/components/JournalCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import JournalEntryForm from "@/components/JournalEntryForm";

interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  profiles: { username: string | null } | null;
}

// Define a type for the joined data based on the Supabase query
type JournalWithProfile = Database['public']['Tables']['journals']['Row'] & { profiles: { username: string | null } | null };

const JournalListPage = () => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJournals = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch journals from the 'journals' table and the author's username from the 'profiles' table
      const { data, error } = await supabase
        .from('journals')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Cast the fetched data to the defined joined type
        setJournals(data as JournalWithProfile[] as JournalEntry[]);
      }
    } catch (error) {
      console.error('Error fetching journals:', error);
      toast({
        title: "Error fetching journals",
        description: "There was a problem loading the journal entries. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  return (
    <div className="min-h-screen bg-alpaca-dark flex flex-col">
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Trading Journals</h1>
          <p className="text-gray-400">
            Share and discuss trading insights and strategies through journal entries.
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <JournalEntryForm onJournalAdded={fetchJournals} />
        </div>

        <div className="flex-1 glass-card p-4 mb-4 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse text-alpaca-purple">Loading journals...</div>
            </div>
          ) : journals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {journals.map((journal) => (
                <JournalCard key={journal.id} journal={journal} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              No journal entries available yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JournalListPage; 