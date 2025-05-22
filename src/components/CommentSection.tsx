import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Comment from "./Comment";
import { useAuth } from '@/contexts/AuthContext'; // Assuming AuthContext is needed for user info
import { Database } from '@/integrations/supabase/types'; // Import Database type

// Use the type from your Supabase types file, make profiles optional and handle potential null username
// Note: Adjusting this type to precisely match the error state is complex.
// We'll make profiles nullable and access username safely.
type CommentType = Database['public']['Tables']['comments']['Row'] & { profiles?: { username: string | null } | null };


interface CommentSectionProps {
  parentId: string; // Generic ID for the parent (journal or blog post)
  parentType: 'journal' | 'blog'; // Type of the parent
}

const CommentSection = ({ parentId, parentType }: CommentSectionProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentType[]>([]); // Use CommentType
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // Get the current user

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);

      let query = supabase
        .from('comments')
        // Still attempt to select profiles(username) - the DB error might be RLS related
        .select('*, profiles(username)')
        .order('created_at', { ascending: true });

      // Filter based on parent type and ID
      if (parentType === 'journal') {
        query = query.eq('journal_id', parentId);
      } else if (parentType === 'blog') {
        query = query.eq('blog_post_id', parentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error fetching comments",
          description: `Could not load comments: ${error.message}`,
          variant: "destructive",
        });
        setComments([]); // Set comments to empty array on error
        return; // Stop execution on error
      }

      if (data) {
        // Cast the data to CommentType[], assuming the select worked
        // If RLS prevents profiles, `profiles` might be null or an empty object depending on Supabase version/config.
        // The CommentType now allows for profiles to be optional, handling this gracefully.
        setComments(data as CommentType[]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error fetching comments",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      setComments([]); // Set comments to empty array on error
    } finally {
      setLoadingComments(false);
    }
  }, [parentId, parentType, toast]); // Added parentId and parentType as dependencies

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to post a comment.",
          variant: "destructive",
        });
        return;
      }

      // Prepare insert payload based on parent type
      const insertPayload: Database['public']['Tables']['comments']['Insert'] = {
        user_id: user.id,
        content: newComment.trim(),
        parent_comment_id: null, // Assuming top-level comments from this input
      };

      if (parentType === 'journal') {
        insertPayload.journal_id = parentId;
        insertPayload.blog_post_id = null; // Ensure blog_post_id is null for journal comments
      } else if (parentType === 'blog') {
        insertPayload.blog_post_id = parentId;
        insertPayload.journal_id = null; // Ensure journal_id is null for blog comments
      }

      // Insert the new comment into Supabase
      const { error: insertError } = await supabase
        .from('comments')
        .insert(insertPayload);

      if (insertError) throw insertError;

      toast({
        title: "Comment posted",
        description: "Your comment has been added.",
      });

      setNewComment(""); // Clear the input
      fetchComments(); // Refresh comments list

    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Failed to post comment",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,      variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>

      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {loadingComments ? (
          <div className="text-gray-400">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            // Pass the comment data including potential profiles to the Comment component
            <Comment key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-gray-400">No comments yet. Be the first to comment!</div>
        )}
      </div>

      {/* New comment form */}
      {user ? (
        <form onSubmit={handlePostComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="bg-white/5 border-white/10 focus:border-alpaca-purple min-h-[80px]"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !user}
            className="bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90"
          >
            <Send size={16} className="mr-2" />
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-gray-500">You must be logged in to comment.</p>
      )}
    </div>
  );
};

export default CommentSection;