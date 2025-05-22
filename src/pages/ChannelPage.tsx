import { useParams } from 'react-router-dom';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { useChannel } from '../hooks/useChannel';

export function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { data: channel, isLoading, error } = useChannel(channelId || '');

  if (!channelId) {
    return <div>Channel ID not provided.</div>;
  }

  if (isLoading) {
    return <div>Loading channel...</div>;
  }

  if (error) {
    return <div>Error loading channel: {error.message}</div>;
  }

  if (!channel) {
    return <div>Channel not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Channel: {channel.name}</h1>
      <div className="flex-1 overflow-y-auto mb-4">
        <MessageList channelId={channelId} />
      </div>
      <MessageInput channelId={channelId} />
    </div>
  );
} 