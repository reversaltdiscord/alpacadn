import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import CommentSection from "@/components/CommentSection";
import { useAuth } from "../contexts/AuthContext";
import JournalEntryForm from '../components/JournalEntryForm';
import { Database } from '@/integrations/supabase/types';

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

const JournalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [journal, setJournal] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const fetchJournal = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch the specific journal entry and the author's username
      const { data, error } = await supabase
        .from('journals')
        .select('*, profiles(username)') // Modified select statement to include profiles username
        .eq('id', id)
        .single(); // Use single() to get a single row

      if (error) {
        throw error;
      }

      if (data) {
        // Cast the fetched data to the defined joined type
        setJournal(data as unknown as JournalWithProfile); // Cast to JournalWithProfile
      } else {
        setError('Journal entry not found.');
      }
    } catch (err) {
      console.error('Error fetching journal:', err);
      setError('Failed to load journal entry.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchJournal();
    }
  }, [id, fetchJournal]);

  const handleDelete = async () => {
    if (!journal) return;

    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', journal.id);

      if (error) {
        console.error('Error deleting journal:', error);
        setError('Failed to delete journal entry.');
      } else {
        navigate('/journals'); // Redirect to journal list after deletion
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleJournalUpdated = () => {
    setIsEditing(false);
    fetchJournal();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!journal) return <div>Journal entry not found.</div>;

  const isOwner = user && user.id === journal.user_id;

  return (
    <div className="min-h-screen bg-alpaca-dark flex flex-col">
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16 flex flex-col">
        {isEditing ? (
          <JournalEntryForm
            initialData={journal}
            onJournalUpdated={handleJournalUpdated}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">{journal.title}</h1>
            <div className="flex items-center text-sm text-gray-400 mb-6">
              <span>{`User ID: ${journal.user_id}`} • {new Date(journal.created_at).toLocaleDateString()}</span>
            </div>
            <div className="text-gray-300 leading-relaxed">
              {/* Render journal content here. For simplicity, just text for now. */}
              {journal.content}
            </div>
            
            {/* Edit and Delete buttons - only show if owner */}
            {isOwner && (
              <div className="mb-4">
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            )}

            {/* CommentSection will be added here later */}
            <CommentSection parentId={journal.id} parentType="journal" />
          </>
        )}
      </main>
    </div>
  );
};

export default JournalDetailPage; 