import { useEffect, useState, useCallback } from "react";
import Footer from "@/components/Footer";
import NoteCard from "@/components/NoteCard";
import UploadNoteForm from "@/components/UploadNoteForm";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  title: string;
  author: string;
  description: string;
  file_path?: string;
  external_link?: string;
  created_at: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setNotes(data.map(note => ({
          ...note,
          // Format the date to a relative time string
          created_at: new Date(note.created_at).toLocaleDateString()
        })));
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error fetching notes",
        description: "There was a problem loading the notes. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setNotes, toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNoteAdded = () => {
    fetchNotes();
  };

  return (
    <div className="min-h-screen bg-alpaca-dark">
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notes</h1>
            <p className="text-gray-400">
              Access and share trading research and strategies
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search notes..."
                className="pl-10 bg-white/5 border-white/10 focus:border-alpaca-purple"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <UploadNoteForm onNoteAdded={handleNoteAdded} />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse text-alpaca-purple">Loading notes...</div>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                title={note.title}
                author={note.author}
                date={note.created_at}
                description={note.description}
                fileUrl={note.file_path}
                externalLink={note.external_link}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">
              {searchTerm ? "No notes match your search" : "No notes available yet"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notes;
