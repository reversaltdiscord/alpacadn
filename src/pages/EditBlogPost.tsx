import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BlogPostForm from '@/components/BlogPostForm'; // Assuming this path is correct
import { getBlogPostById, updateBlogPost, BlogPostWithTags } from '../integrations/supabase/blog';
import { useAuth } from '@/contexts/AuthContext';
import { TablesUpdate } from '../integrations/supabase/types';

function EditBlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const { data: blogPost, isLoading: postLoading, error: fetchError } = useQuery<BlogPostWithTags | null>({
    queryKey: ['blogPost', id],
    queryFn: () => id ? getBlogPostById(id) : Promise.resolve(null),
    enabled: !!id && !authLoading, // Only fetch if id is available and auth is not loading
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates, tagNames }: { id: string; updates: TablesUpdate<'blog_posts'>; tagNames?: string[] }) => updateBlogPost(id, updates, tagNames),
    onSuccess: (data) => {
      // Invalidate the individual blog post query and the list query
      queryClient.invalidateQueries({ queryKey: ['blogPost', id] });
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      // Redirect to the updated blog post page
      if (data) {
        navigate(`/blog/${data.id}`);
      } else {
         // Handle case where data is null (update failed for some reason not caught by onError)
        console.error('Post update returned null data.');
        // TODO: Show an error message
      }
    },
    onError: (error) => {
      console.error('Error updating blog post:', error);
      // TODO: Show a user-friendly error message
    },
  });

  // Check if the current user is the author of the post AFTER post data is loaded
  const isAuthor = user && blogPost && blogPost.user_id === user.id;

  // Determine overall loading state
  const isLoading = postLoading || authLoading || updateMutation.status === 'pending';

  // Handle loading, errors, post not found, and unauthorized access
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchError) {
    return <div>Error loading blog post for editing: {fetchError.message}</div>;
  }

  if (!blogPost) {
    return <div>Blog post not found.</div>;
  }

  if (!user) {
      // User is not logged in
      // TODO: Redirect to login page
      return <div>Please log in to edit blog posts.</div>;
  }

  if (!isAuthor) {
    // User is logged in but not the author
    // TODO: Show an unauthorized message or redirect
    return <div>You do not have permission to edit this post.</div>;
  }

  const handleSubmit = (values: { title: string; content: string; tagNames: string[] }) => {
      const updates: TablesUpdate<'blog_posts'> = {
        title: values.title,
        content: values.content,
        // updated_at could be set by a Supabase trigger
      };
      if (id) {
        updateMutation.mutate({ id, updates, tagNames: values.tagNames });
      }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <BlogPostForm initialData={blogPost} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

export default EditBlogPost; 