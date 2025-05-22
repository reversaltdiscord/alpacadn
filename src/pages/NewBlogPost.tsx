import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BlogPostForm from '@/components/BlogPostForm'; // Assuming this path is correct
import { createBlogPost } from '../integrations/supabase/blog';
import { useAuth } from '@/contexts/AuthContext';
import { TablesInsert } from '../integrations/supabase/types';

function NewBlogPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createMutation = useMutation({
    mutationFn: ({ post, tagNames }: { post: TablesInsert<'blog_posts'>; tagNames: string[] }) => createBlogPost(post, tagNames),
    onSuccess: (data) => {
      // Invalidate the blog posts list query
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      // Redirect to the new blog post page
      if (data) {
        navigate(`/blog/${data.id}`);
      } else {
        // Handle case where data is null (creation failed for some reason not caught by onError)
        console.error('Post creation returned null data.');
        // TODO: Show an error message
      }
    },
    onError: (error) => {
      console.error('Error creating blog post:', error);
      // TODO: Show a user-friendly error message
    },
  });

  const handleSubmit = (values: { title: string; content: string; tagNames: string[] }) => {
    const newPost: TablesInsert<'blog_posts'> = {
      user_id: user.id, // Use the authenticated user's ID
      title: values.title,
      content: values.content,
      // created_at will be set by Supabase by default
    };
    createMutation.mutate({ post: newPost, tagNames: values.tagNames });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Create New Blog Post</h1>
      <BlogPostForm onSubmit={handleSubmit} isLoading={createMutation.status === 'pending'} />
    </div>
  );
}

export default NewBlogPost; 