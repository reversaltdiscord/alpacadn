import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBlogPostById, deleteBlogPost, BlogPostWithTags } from '../integrations/supabase/blog';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CommentSection from '../components/CommentSection';
// We will need to import the Supabase auth client later to check the current user
// import { supabase } from '../integrations/supabase/client';

function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  // TODO: Get the current authenticated user's ID from Supabase auth
  const currentUserId = user?.id;

  const { data: blogPost, isLoading: postLoading, error } = useQuery<BlogPostWithTags | null>({
    queryKey: ['blogPost', id],
    queryFn: () => id ? getBlogPostById(id) : Promise.resolve(null),
    enabled: !!id,
  });

  // Combine loading states
  const isLoading = postLoading || authLoading;

  // Mutation for deleting a blog post
  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      // Invalidate the blog posts list query so it refetches
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      // Redirect to the blog list page after deletion
      navigate('/blog');
    },
    onError: (err) => {
      console.error('Error deleting blog post:', err);
      // TODO: Show a user-friendly error message
    },
  });

  // Check if the current user is the author of the post
  const isAuthor = currentUserId && blogPost && blogPost.user_id === currentUserId;

  const handleDelete = () => {
    if (id && confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading blog post...</div>;
  }

  if (error) {
    return <div>Error loading blog post: {error.message}</div>;
  }

  if (!blogPost) {
    return <div>Blog post not found.</div>;
  }

  // Format the creation date
  const formattedDate = new Date(blogPost.created_at).toLocaleDateString();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">{blogPost.title}</h1>
      <p className="text-gray-500 text-sm mb-6">Published on {formattedDate}</p>

      {/* Display tags here */}
      {blogPost.tags && blogPost.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {blogPost.tags.map(tag => (
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

      <div className="prose max-w-none mb-8">
        {/* Using prose class for basic styling of content */}
        <p>{blogPost.content}</p>
        {/* TODO: Render rich text content if applicable */}
      </div>

      {isAuthor && (
        <div className="flex gap-4">
          {/* TODO: Add Link to edit page */} 
          <Link to={`/blog/edit/${blogPost.id}`}>
             <Button variant="outline">Edit Post</Button>
          </Link>
          <Button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={deleteMutation.status === 'pending'}
          >
            {deleteMutation.status === 'pending' ? 'Deleting...' : 'Delete Post'}
          </Button>
        </div>
      )}

      {/* Add CommentSection */} 
      {blogPost && (
        <CommentSection parentId={blogPost.id} parentType="blog" />
      )}
    </div>
  );
}

export default BlogPost; 