import { useChannels } from '../hooks/useChannels';
import { Channel } from '../integrations/supabase/chat';
import clsx from 'clsx';

interface ChannelListProps {
  onSelectChannel: (channel: Channel) => void;
  selectedChannelId: string | null;
}

export function ChannelList({ onSelectChannel, selectedChannelId }: ChannelListProps) {
  const { data: channels, isLoading, error } = useChannels();

  if (isLoading) {
    return <div>Loading channels...</div>;
  }

  if (error) {
    return <div>Error loading channels: {error.message}</div>;
  }

  if (!channels || channels.length === 0) {
    return <div>No channels available.</div>;
  }

  return (
    <nav>
      <h2 className="text-lg font-semibold mb-4 text-white">Channels</h2>
      <ul>
        {channels.map((channel) => (
          <li key={channel.id} className="mb-1">
            <div
              className={clsx(
                "p-2 rounded-md cursor-pointer",
                "hover:bg-gray-600",
                selectedChannelId === channel.id && "bg-gray-600"
              )}
              onClick={() => onSelectChannel(channel)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectChannel(channel);
                }
              }}
            >
              #{channel.name}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
} 