import { useQuery } from '@tanstack/react-query';
import { getChannels } from '../integrations/supabase/chat';

export function useChannel(channelId: string) {
  return useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const channels = await getChannels();
      return channels?.find(channel => channel.id === channelId);
    },
    enabled: !!channelId,
  });
} 