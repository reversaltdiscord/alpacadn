import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PencilLine } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface JournalEntryFormProps {
  onJournalAdded?: () => void;
  initialData?: { id: string; title: string; content: string };
  onJournalUpdated?: () => void;
  onCancel?: () => void;
}

const JournalEntryForm = ({ onJournalAdded, initialData, onJournalUpdated, onCancel }: JournalEntryFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create/edit a journal entry.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const journalData = {
      title,
      content,
      user_id: user.id,
    };

    let error = null;

    if (initialData?.id) { // Editing existing entry
      const { error: updateError } = await supabase
        .from('journals')
        .update(journalData)
        .eq('id', initialData.id);
      error = updateError;
    } else { // Creating new entry
      const { error: insertError } = await supabase
        .from('journals')
        .insert(journalData);
      error = insertError;
    }

    if (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: 'Error',
        description: `Failed to save journal entry: ${error.message}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Journal entry successfully ${initialData?.id ? 'updated' : 'created'}.`,
      });
      if (initialData?.id) {
        onJournalUpdated?.();
      } else {
        onJournalAdded?.();
        setTitle('');
        setContent('');
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90">
          <PencilLine size={16} className="mr-2" />
          Create Journal
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-card bg-alpaca-dark/90">
        <DialogHeader>
          <DialogTitle>Create New Journal Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your journal title"
              className="bg-white/5 border-white/10 focus:border-alpaca-purple"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your journal entry here..."
              className="bg-white/5 border-white/10 focus:border-alpaca-purple min-h-[150px]"
              disabled={loading}
              required
              rows={10}
            />
          </div>

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90 w-full"
            >
              {loading ? "Saving..." : initialData?.id ? "Save Changes" : "Create Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryForm; 