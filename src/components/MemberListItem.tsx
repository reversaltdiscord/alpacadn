import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import ChannelMember type if needed, or define props directly
import { ChannelMember } from '../integrations/supabase/chat';
import { clsx } from 'clsx';

interface MemberListItemProps {
  member: ChannelMember;
  isCurrentUser?: boolean; // Optional prop to highlight the current user
}

export function MemberListItem({ member, isCurrentUser = false }: MemberListItemProps) {
  return (
    <div className={clsx("flex items-center gap-2", isCurrentUser && "font-bold text-alpaca-purple")}>
      <Avatar className="h-7 w-7">
        <AvatarImage src={member.avatar_url || undefined} />
        <AvatarFallback className="bg-gray-600 text-white text-xs">
          {member.username ? member.username.charAt(0).toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-gray-200">{member.username || 'Unknown User'}</span>
    </div>
  );
} 