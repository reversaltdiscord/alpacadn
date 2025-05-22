import React from 'react';
// Import the Channel type and ChannelMember type
import { Channel, ChannelMember } from '../integrations/supabase/chat';
// Import the useChannelMembers hook
import { useChannelMembers } from '../hooks/useChannelMembers';
// Import the MemberListItem component
import { MemberListItem } from './MemberListItem';
// Import the useAuth hook
import { useAuth } from '../contexts/AuthContext';

// This component will display the list of members in the current channel/server
interface MemberListProps {
  selectedChannel: Channel | null;
}

export function MemberList({ selectedChannel }: MemberListProps) {
  // Use the useChannelMembers hook to fetch members for the selected channel
  const { data: members, isLoading, error } = useChannelMembers(selectedChannel?.id || null);
  // Use the useAuth hook to get the current user
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Member List Header */}
      <div className="p-3 border-b border-gray-600">
        <h2 className="text-lg font-bold text-white">Members</h2>
      </div>

      {/* Member List */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2">
        {/* Individual members will be listed here */}
        {!selectedChannel && <p className="text-gray-300">Select a channel to view members.</p>}
        {selectedChannel && isLoading && <p className="text-gray-300">Loading members...</p>}
        {selectedChannel && error && <p className="text-red-500">Error loading members: {error.message}</p>}
        {selectedChannel && members && members.length === 0 && <p className="text-gray-300">No members in this channel yet.</p>}
        {selectedChannel && members && members.length > 0 && (
          <ul>
            {members.map(member => (
              <li key={member.id} className="text-gray-200 text-sm">
                {/* Render MemberListItem component for each member */}
                <MemberListItem member={member} isCurrentUser={user?.id === member.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 