import React from 'react';
import { User } from "lucide-react";
// We might add support for displaying replies later
// import Comment from "./Comment";

interface CommentProps {
  comment: {
    id: string;
    journal_id: string;
    user_id: string;
    content: string;
    created_at: string;
    parent_comment_id: string | null;
    profiles: { username: string | null } | null; // Include profiles in the prop type
  };
}

const Comment = ({ comment }: CommentProps) => {
  // Format date for display
  const formattedDate = new Date(comment.created_at).toLocaleString(); // Using toLocaleString for potentially more detail

  return (
    <div className="border rounded-md p-4 bg-white/5 border-white/10">
      <div className="flex items-center text-sm text-gray-400 mb-2">
        <User size={14} className="mr-1" />
        <span>{comment.profiles?.username || 'Anonymous'} • {formattedDate}</span> {/* Displaying username */}
      </div>
      <div className="text-gray-300 leading-relaxed">
        {comment.content}
      </div>
      {/* We can add a Reply button and display child comments here later */}
    </div>
  );
};

export default Comment; 