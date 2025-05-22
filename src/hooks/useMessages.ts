import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages, subscribeToMessages, unsubscribeFromMessages, Message } from '../integrations/supabase/chat';
import { useEffect } from 'react';

export function useMessages(channelId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Message[], Error>({
    queryKey: ['messages', channelId],
    queryFn: () => getMessages(channelId),
    enabled: !!channelId, // Only fetch if channelId is available
  });

  useEffect(() => {
    if (!channelId) return;

    const subscription = subscribeToMessages(channelId, (newMessage) => {
      queryClient.setQueryData<Message[]>(['messages', channelId], (oldMessages) => {
        if (oldMessages && !oldMessages.find(msg => msg.id === newMessage.id)) {
          return [...oldMessages, newMessage];
        } else if (!oldMessages) {
          return [newMessage];
        }
        return oldMessages; // Return old messages if new message already exists
      });
    });

    return () => {
      unsubscribeFromMessages(subscription);
    };
  }, [channelId, queryClient]);

  return query;
} 