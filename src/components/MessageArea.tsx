import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage'; // Import ChatMessage
import { Input } from '@/components/ui/input'; // Import Input
import { Button } from '@/components/ui/button'; // Import Button
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQuery and useQueryClient
import { getMessages, Message, subscribeToMessages, unsubscribeFromMessages } from '../integrations/supabase/chat'; // Import getMessages, Message type, and subscription functions
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useSendMessage } from '../hooks/useSendMessage'; // Import useSendMessage
import { RealtimeChannel } from '@supabase/supabase-js'; // Import RealtimeChannel

// Define the props for MessageArea
interface MessageAreaProps {
  selectedChannel: { id: string; name: string } | null; // Assuming channel has id and name, and can be null
}

// This component will handle displaying messages and the message input
export function MessageArea({ selectedChannel }: MessageAreaProps) {
  const [newMessage, setNewMessage] = useState('');

  // Get the current user
  const { user } = useAuth();

  // Get query client for optimistic updates
  const queryClient = useQueryClient();

  // Ref to store the real-time subscription
  const messageSubscriptionRef = useRef<RealtimeChannel | null>(null);

  // Use the send message mutation hook
  const sendMessageMutation = useSendMessage();

  // Fetch messages for the selected channel using React Query
  const { data: messages, isLoading, isError } = useQuery<Message[] | undefined>({
    queryKey: ['messages', selectedChannel?.id], // Query key includes channel ID
    queryFn: () => getMessages(selectedChannel!.id), // Fetch function
    enabled: !!selectedChannel, // Only run query if a channel is selected
  });

  // Effect to manage real-time subscription
  useEffect(() => {
    // Unsubscribe from previous channel if exists
    if (messageSubscriptionRef.current) {
      unsubscribeFromMessages(messageSubscriptionRef.current);
      messageSubscriptionRef.current = null;
    }

    if (selectedChannel) {
      // Subscribe to the new channel
      const subscription = subscribeToMessages(selectedChannel.id, (newMessage: Message) => {
        // Optimistically update the messages cache with the new message
        queryClient.setQueryData<Message[]>(['messages', selectedChannel.id], (oldMessages) => {
          // Ensure oldMessages is an array, add new message if not already present
          const updatedMessages = Array.isArray(oldMessages) ? oldMessages : [];
          // Prevent adding duplicate messages if the component somehow receives the same message twice
          if (!updatedMessages.some(msg => msg.id === newMessage.id)) {
             // Add the profile data received with the real-time update to the message object
             // This assumes the RLS policy and Supabase configuration is set up to return profile data
             // with real-time inserts if the join is specified in the RLS policy.
             // If not, we might need to fetch the profile separately here.
             // Based on the getMessages function, the join is included, so hopefully real-time includes it too.
             // Let's add a check just in case profiles is null.
             const messageWithProfile: Message = {
                ...newMessage,
                profiles: newMessage.profiles || null // Ensure profiles is included or null
             };
             return [...updatedMessages, messageWithProfile];
          }
           return updatedMessages;
        });
      });

      // Store the active subscription
      messageSubscriptionRef.current = subscription;
    }

    // Cleanup function to unsubscribe when the component unmounts or selectedChannel changes
    return () => {
      if (messageSubscriptionRef.current) {
        unsubscribeFromMessages(messageSubscriptionRef.current);
        messageSubscriptionRef.current = null;
      }
    };
  }, [selectedChannel?.id, queryClient, selectedChannel]); // Re-run effect when selectedChannel ID changes or queryClient instance changes (though queryClient is usually stable)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChannel && user) {
      try {
        // Call the send message mutation, userId is handled by the hook
        await sendMessageMutation.mutateAsync({
          channelId: selectedChannel.id,
          content: newMessage,
          // userId is handled by the useSendMessage hook
        });
        setNewMessage(''); // Clear input after sending
      } catch (error) {
        console.error('Error sending message:', error);
        // TODO: Show a user-friendly error message
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message Area Header (Channel Name, Topic) */}
      <div className="p-3 border-b border-gray-500">
        <h2 className="text-lg font-bold text-white">
          {selectedChannel ? `#${selectedChannel.name}` : 'Select a channel'}
        </h2>
      </div>

      {/* Message List */}
      <div className="flex-grow overflow-y-auto p-3 space-y-4">
        {/* Individual messages will be mapped here */}
        {!selectedChannel && <p className="text-gray-300">Select a channel to view messages.</p>}
        {isLoading && <p className="text-gray-300">Loading messages...</p>}
        {isError && <p className="text-red-500">Error loading messages.</p>}
        {messages?.map(message => (
          <ChatMessage
            key={message.id}
            message={message} // Pass the full message object
            currentUser={user} // Pass the current user
            // Removed individual props:
            // username={message.profiles?.username || 'Unknown User'}
            // avatar={message.profiles?.avatar_url ? message.profiles.avatar_url : undefined}
            // content={message.content || ''}
            // timestamp={new Date(message.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            // isCurrentUser={user?.id === message.user_id} // This logic is now inside ChatMessage
          />
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-500 flex items-center gap-2">
        <Input
          placeholder={selectedChannel ? `Message #${selectedChannel.name}` : 'Select a channel to message'}
          className="flex-grow bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!selectedChannel || sendMessageMutation.isPending} // Disable input if no channel selected or sending
        />
        <Button type="submit" disabled={!selectedChannel || !newMessage.trim() || sendMessageMutation.isPending}>Send</Button>
      </form>
    </div>
  );
}