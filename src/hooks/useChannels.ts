import { useQuery } from '@tanstack/react-query';
import { getChannels } from '../integrations/supabase/chat';

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
  });
} 