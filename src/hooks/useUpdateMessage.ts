import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMessage, Message } from '../integrations/supabase/chat';

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, newContent }: { messageId: string; newContent: string }) =>
      updateMessage(messageId, newContent),
    onSuccess: (updatedMessage) => {
      // Optimistically update the messages list in the cache
      if (updatedMessage) {
        queryClient.setQueryData<Message[] | undefined>(['messages', updatedMessage.channel_id], (oldMessages) => {
          return oldMessages?.map(message => 
            message.id === updatedMessage.id ? updatedMessage : message
          );
        });
      }
    },
    onError: (error, { messageId }) => {
      console.error(`Error updating message ${messageId}:`, error);
      // TODO: Implement user-friendly error notification
    },
  });
} 