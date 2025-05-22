import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMessage } from '../integrations/supabase/chat';
// Removed unused import Message type
// import { Message } from '../integrations/supabase/chat'; // Import Message type for cache update

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      // Invalidate the messages query to refetch after deletion
      // This assumes the component using this hook knows the channelId and the messages query key includes it.
      // A more robust solution would pass channelId here or invalidate queries more specifically.
      // For now, let's invalidate all messages queries or rely on a pattern.

      // Invalidating all queries with 'messages' key - simple but can refetch more than needed.
      queryClient.invalidateQueries({ queryKey: ['messages'] });

       // A toast notification for successful deletion could go here
    },
    onError: (error, messageId) => {
      console.error(`Error deleting message ${messageId}:`, error);
      // TODO: Implement user-friendly error notification and potentially revert optimistic update
    },
  });
} 