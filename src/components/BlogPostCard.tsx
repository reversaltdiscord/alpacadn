import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPostWithTags } from '../integrations/supabase/blog';

interface BlogPostCardProps {
  post: BlogPostWithTags;
}

function BlogPostCard({ post }: BlogPostCardProps) {
  // Format the creation date
  const formattedDate = new Date(post.created_at).toLocaleDateString();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
      <Link to={`/blog/${post.id}`} className="hover:underline mb-2">
        <h2 className="text-xl font-semibold">{post.title}</h2>
      </Link>
      <p className="text-gray-600 mb-4 flex-grow">{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
      <p className="text-sm text-gray-500 mb-2">Published on {formattedDate}</p>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {post.tags.map(tag => (
            <span
              key={tag.id}
              className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200"
            >
              {tag.name}
            </span>
          ))
        }
        </div>
      )}
    </div>
  );
}

export default BlogPostCard; 