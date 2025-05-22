import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '../integrations/supabase/chat';
import { useAuth } from './useAuth';

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Assuming useAuth hook provides the current user

  return useMutation({
    mutationFn: ({ channelId, content }: { channelId: string; content: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      return sendMessage(channelId, content, user.id);
    },
    onSuccess: (_, variables) => {
      // Invalidate the messages query for the specific channel to refetch
      queryClient.invalidateQueries({ queryKey: ['messages', variables.channelId] });
    },
  });
} 