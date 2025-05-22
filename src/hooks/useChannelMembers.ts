import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getChannelMembers, ChannelMember, Message, subscribeToMessages, unsubscribeFromMessages } from '../integrations/supabase/chat';
import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useChannelMembers(channelId: string | null) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  const queryResult = useQuery<ChannelMember[] | undefined>({
    queryKey: ['channel-members', channelId],
    queryFn: () => getChannelMembers(channelId as string),
    enabled: !!channelId,
  });

  useEffect(() => {
    // Unsubscribe from previous channel if exists
    if (subscriptionRef.current) {
      unsubscribeFromMessages(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    if (channelId) {
      // Subscribe to new messages in the selected channel
      const subscription = subscribeToMessages(channelId, (newMessage: Message) => {
        // When a new message arrives, check if the sender is already in the member list
        queryClient.setQueryData<ChannelMember[] | undefined>(['channel-members', channelId], (oldMembers) => {
          const updatedMembers = Array.isArray(oldMembers) ? oldMembers : [];
          // Check if the new message has profile information and if the user is already in the list
          if (newMessage.profiles && !updatedMembers.some(member => member.id === newMessage.user_id)) {
             // Add the new member's profile to the list
             // Note: newMessage.profiles is the profile data included with the message.
             // We need to cast it to ChannelMember type.
             const newMember: ChannelMember = { 
                id: newMessage.user_id, // The user_id from the message is the profile id
                username: newMessage.profiles.username, 
                avatar_url: newMessage.profiles.avatar_url,
                // Include other profile fields if necessary based on ChannelMember type
             };
             return [...updatedMembers, newMember];
          }
          return updatedMembers;
        });
      });

      // Store the active subscription
      subscriptionRef.current = subscription;
    }

    // Cleanup function to unsubscribe when the component unmounts or channelId changes
    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromMessages(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [channelId, queryClient]); // Re-run effect when channelId changes or queryClient instance changes

  return queryResult;
} 