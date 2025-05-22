import { useMessages } from '../hooks/useMessages';
import { Message } from '../integrations/supabase/chat';

interface MessageListProps {
  channelId: string;
}

export function MessageList({ channelId }: MessageListProps) {
  const { data: messages, isLoading, error } = useMessages(channelId);

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  if (error) {
    return <div>Error loading messages: {error.message}</div>;
  }

  if (!messages || messages.length === 0) {
    return <div>No messages yet.</div>;
  }

  return (
    <div className="flex flex-col space-y-2">
      {messages.map((message) => (
        <div key={message.id} className="p-2 bg-gray-100 rounded">
          <p className="text-sm font-semibold">{message.profiles?.username || message.user_id || 'Unknown User'}</p>
          <p>{message.content}</p>
          <p className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
} 