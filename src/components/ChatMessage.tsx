import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { clsx } from 'clsx';
import { Message } from '../integrations/supabase/chat';
import { useUpdateMessage } from '../hooks/useUpdateMessage';
import { useDeleteMessage } from '../hooks/useDeleteMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@supabase/supabase-js';

interface ChatMessageProps {
  message: Message;
  currentUser: User | null;
}

const ChatMessage = ({
  message,
  currentUser,
}: ChatMessageProps) => {
  const { id, content, created_at, profiles } = message;
  const username = profiles?.username || 'Unknown User';
  const avatar = profiles?.avatar_url || undefined;
  const isCurrentUser = currentUser?.id === message.user_id;

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content || '');

  const updateMessageMutation = useUpdateMessage();
  const deleteMessageMutation = useDeleteMessage();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedContent(content || '');
  };

  const handleSaveClick = async () => {
    if (editedContent.trim() && editedContent !== content) {
      updateMessageMutation.mutate({ messageId: id, newContent: editedContent });
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessageMutation.mutate(id);
    }
  };

  const timestamp = new Date(created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={clsx("flex items-start gap-2 mb-4", isCurrentUser ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} />
        <AvatarFallback className="bg-alpaca-purple/20 text-alpaca-purple">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div
        className={clsx(
          "max-w-[80%]",
          isCurrentUser
            ? "bg-alpaca-purple/20 rounded-l-lg rounded-br-lg"
            : "bg-white/5 rounded-r-lg rounded-bl-lg",
          "px-4 py-2"
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={clsx("text-xs font-medium", isCurrentUser ? "text-alpaca-purple" : "text-accent")}>
            {username}
          </span>
          <span className="text-xs text-gray-400 ml-2">{timestamp}</span>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Input
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="text-sm text-gray-200 bg-gray-700 border-gray-600"
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSaveClick}>Save</Button>
              <Button variant="ghost" size="sm" onClick={handleCancelClick}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-200">{content}</p>
        )}

        {isCurrentUser && !isEditing && (
          <div className="flex gap-2 mt-1">
            <Button variant="ghost" size="sm" onClick={handleEditClick} className="text-gray-400 hover:text-white">Edit</Button>
            <Button variant="ghost" size="sm" onClick={handleDeleteClick} className="text-red-400 hover:text-red-500">Delete</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;