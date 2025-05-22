import { supabase } from './client';
import { Database } from './types';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type Message = Database['public']['Tables']['messages']['Row'] & { profiles: { username: string | null, avatar_url: string | null } | null };
export type Channel = Database['public']['Tables']['channels']['Row'];
export type ChannelMember = Database['public']['Tables']['profiles']['Row'];

export async function getChannels() {
  const { data, error } = await supabase
    .from('channels')
    .select('*');
  if (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
  return data;
}

export async function getMessages(channelId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(username, avatar_url)')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error(`Error fetching messages for channel ${channelId}:`, error);
    throw error;
  }
  return data as Message[];
}

export async function sendMessage(channelId: string, content: string, userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        channel_id: channelId,
        content: content,
        user_id: userId,
      },
    ]);
  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }
  return data;
}

export function subscribeToMessages(channelId: string, callback: (payload: Message) => void) {
  const subscription: RealtimeChannel = supabase
    .channel(`messages:${channelId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
      (payload: RealtimePostgresChangesPayload<Message>) => {
        console.log('New message received:', payload);
        if (payload.new && 'id' in payload.new) {
          callback(payload.new as Message);
        }
      }
    )
    .subscribe();

  return subscription;
}

export function unsubscribeFromMessages(subscription: RealtimeChannel) {
  supabase.removeChannel(subscription);
}

export async function createChannel(name: string) {
  const { data, error } = await supabase
    .from('channels')
    .insert([
      { name: name }
    ]);
  if (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
  return data;
}

export async function getChannelMembers(channelId: string): Promise<ChannelMember[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('user_id, profiles(id, username, avatar_url)')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching members for channel ${channelId}:`, error);
    throw error;
  }

  const uniqueMembers: ChannelMember[] = [];
  const seenUserIds = new Set<string>();

  data.forEach(message => {
    if (message.profiles && !seenUserIds.has(message.user_id)) {
      uniqueMembers.push(message.profiles);
      seenUserIds.add(message.user_id);
    }
  });

  return uniqueMembers;
}

// Function to update a message
export async function updateMessage(messageId: string, newContent: string) {
  const { data, error } = await supabase
    .from('messages')
    .update({ content: newContent })
    .eq('id', messageId)
    .select(); // Select the updated row to return

  if (error) {
    console.error(`Error updating message ${messageId}:`, error);
    throw error;
  }
  // Supabase update returns an array of updated rows
  return data ? data[0] as Message : null;
}

// Function to delete a message
export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error(`Error deleting message ${messageId}:`, error);
    throw error;
  }
  return true; // Indicate success
} 